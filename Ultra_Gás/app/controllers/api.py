from flask import Blueprint, jsonify, request


api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/estoque', methods=['GET'])
def api_estoque():
    """Retorna dados simulados para o gráfico de estoque.

    Estrutura retornada:
    {
      "summary": { "statusText": "..." },
      "pie": { "p45": 10, "p20": 5, ... }
    }
    """
    # Tenta buscar dados reais do banco
    try:
        # Import dentro do bloco para evitar problemas de import circular na inicialização
        # e para só tentar acessar o DB quando este endpoint for chamado.
        from app.models.estoque import Estoque, DEFAULT_CAPACITY
        estoque = Estoque.query.first()
        if estoque:
            # Usa DEFAULT_CAPACITY (definido em app/models/estoque.py) para compor a mensagem.
            data = {
                "summary": {"statusText": f"Estoque: {estoque.total()} / {DEFAULT_CAPACITY} itens ({estoque.percent(DEFAULT_CAPACITY)}%)"},
                "pie": estoque.to_pie()
            }
            return jsonify(data)
    except Exception:
        # se houver qualquer problema com o DB, cai no mock abaixo
        pass

    # Fallback mock
    data = {
        "summary": {"statusText": "Mock: estoque equilibrado — itens com baixa quantidade: 3"},
        "pie": {
            "p45": 20,
            "p20": 20,
            "p13": 13,
            "p8": 8,
            "p5": 5,
            "agua": 15
        }
    }
    return jsonify(data)


@api_bp.route('/pedidos', methods=['POST'])
def api_pedidos():
    """Recebe um pedido do front-end, valida e grava como uma Entrega.

    Aceita payloads flexíveis:
      - já formatado: { endereco, destinatario, produto, metodo_pagamento }
      - ou raw: { endereco, cliente, produtos: [{nome,quantidade}], pagamentos: [metodo] }

    Retorna 201 com o registro salvo ou 400/500 em erro.
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'error': 'JSON inválido'}), 400

    if not isinstance(data, dict):
        return jsonify({'error': 'Payload inválido'}), 400

    endereco = data.get('endereco') or data.get('rua')
    destinatario = data.get('destinatario') or data.get('cliente')

    # normalizar produto: pode vir como string ou como lista de objetos
    produto = data.get('produto')
    if not produto and isinstance(data.get('produtos'), list):
        parts = []
        for p in data.get('produtos'):
            nome = p.get('nome') if isinstance(p, dict) else None
            quantidade = p.get('quantidade') if isinstance(p, dict) else None
            if nome and quantidade:
                parts.append(f"{nome}:{quantidade}")
        produto = ', '.join(parts) if parts else None

    # normalizar método de pagamento (single)
    metodo = data.get('metodo_pagamento')
    if not metodo and isinstance(data.get('pagamentos'), list):
        metodo = data.get('pagamentos')[0] if len(data.get('pagamentos')) > 0 else None

    # validações básicas
    if not endereco or not destinatario:
        return jsonify({'error': 'Campos obrigatórios ausentes: endereco e destinatario'}), 400
    if not produto:
        return jsonify({'error': 'Nenhum produto informado'}), 400

    allowed = {'pix', 'a_prazo', 'cartao', 'dinheiro'}
    if metodo and metodo not in allowed:
        return jsonify({'error': 'metodo_pagamento inválido'}), 400

    # grava no banco
    try:
        from app import db
        from app.models.entregas import Entrega

        preco = data.get('preco') or ''

        entrega = Entrega(
            endereco=endereco,
            destinatario=destinatario,
            produto=produto,
            metodo_pagamento=metodo,
            encarregado='',   # inicia vazio
            entregue=False,   # inicia não entregue
            pago=False,        # inicia não pago
            preco=preco        # valor calculado pelo front-end
        )
        db.session.add(entrega)
        db.session.commit()

        return jsonify({'ok': True, 'entrega': entrega.to_dict()}), 201
    except Exception as e:
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({'error': 'Falha ao gravar entrega', 'detail': str(e)}), 500


@api_bp.route('/financeiro', methods=['GET'])
def api_financeiro():
    """Retorna dados simulados para o gráfico financeiro.

    Estrutura retornada compatível com Chart.js (labels + datasets).
    """
    # Tenta usar dados reais do banco (tabela metodos_pagamento)
    try:
        from app.models.metodosPagamento import MetodosPagamento
        mp = MetodosPagamento.query.first()
        if mp:
            data = {
                "labels": ["A prazo", "Pix", "Cartão", "Dinheiro"],
                "datasets": [
                    {
                        "data": mp.as_list(),
                        "backgroundColor": ["#4dc9f6", "#f67019", "#f53794", "#537bc4"]
                    }
                ]
            }
            return jsonify(data)
    except Exception:
        # se qualquer erro ao acessar o DB, cai no mock
        pass

    # Fallback mock (caso DB não esteja disponível)
    data = {
        "labels": ["A prazo", "Pix", "Cartão", "Dinheiro"],
        "datasets": [
            {
                "data": [40, 10, 20, 15],
                "backgroundColor": ["#4dc9f6", "#f67019", "#f53794", "#537bc4"]
            }
        ]
    }
    return jsonify(data)


@api_bp.route('/clientes', methods=['POST'])
def api_clientes_create():
    """Cria um novo cliente a partir do payload { endereco: '...' }.

    Retorna 201 com o cliente criado ou 400/500 em caso de falha.
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'error': 'JSON inválido'}), 400

    if not isinstance(data, dict):
        return jsonify({'error': 'Payload inválido'}), 400

    endereco = data.get('endereco')
    if not endereco or not str(endereco).strip():
        return jsonify({'error': 'Campo endereco é obrigatório'}), 400

    try:
        from app import db
        from app.models.clientes import Cliente

        cliente = Cliente(endereco=str(endereco).strip())
        db.session.add(cliente)
        db.session.commit()

        return jsonify({'ok': True, 'cliente': cliente.to_dict()}), 201
    except Exception as e:
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({'error': 'Falha ao criar cliente', 'detail': str(e)}), 500


@api_bp.route('/entregas/<int:entrega_id>/confirm', methods=['POST'])
def api_entrega_confirm(entrega_id):
    """Marca uma entrega como entregue (entregue=True). Retorna registro atualizado."""
    try:
        from app import db
        from app.models.entregas import Entrega
        entrega = Entrega.query.get(entrega_id)
        if not entrega:
            return jsonify({'error': 'Entrega não encontrada'}), 404
        entrega.entregue = True
        db.session.commit()
        return jsonify({'ok': True, 'entrega': entrega.to_dict()})
    except Exception as e:
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({'error': 'Falha ao confirmar entrega', 'detail': str(e)}), 500


@api_bp.route('/entregas/<int:entrega_id>/pagar', methods=['POST'])
def api_entrega_pagar(entrega_id):
    """Marca uma entrega como paga (pago=True) somente se já estiver entregue."""
    try:
        from app import db
        from app.models.entregas import Entrega
        entrega = Entrega.query.get(entrega_id)
        if not entrega:
            return jsonify({'error': 'Entrega não encontrada'}), 404
        if not entrega.entregue:
            return jsonify({'error': 'Entrega ainda não marcada como entregue'}), 400
        entrega.pago = True
        db.session.commit()
        return jsonify({'ok': True, 'entrega': entrega.to_dict()})
    except Exception as e:
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({'error': 'Falha ao marcar pagamento', 'detail': str(e)}), 500
