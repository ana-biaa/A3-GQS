from flask import Blueprint, jsonify, request, session


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
    """Retorna dados para o gráfico financeiro com base nas entregas.

    Conta quantas entregas (entregue=True) foram realizadas por cada método de pagamento.
    Estrutura retornada compatível com Chart.js (labels + datasets).
    """
    from sqlalchemy import func
    try:
        from app import db
        from app.models.entregas import Entrega

        # Métodos conhecidos e ordem fixa
        metodos_ordem = ["a_prazo", "pix", "cartao", "dinheiro"]
        counts_map = {m: 0 for m in metodos_ordem}

        resultados = db.session.query(Entrega.metodo_pagamento, func.count(Entrega.id)) \
            .filter(Entrega.metodo_pagamento.isnot(None), Entrega.entregue.is_(True)) \
            .group_by(Entrega.metodo_pagamento).all()

        for metodo, qtd in resultados:
            if metodo in counts_map:
                counts_map[metodo] = qtd

        data = {
            "labels": ["A prazo", "Pix", "Cartão", "Dinheiro"],
            "datasets": [
                {
                    "data": [counts_map["a_prazo"], counts_map["pix"], counts_map["cartao"], counts_map["dinheiro"]],
                    "backgroundColor": ["#4dc9f6", "#f67019", "#f53794", "#537bc4"]
                }
            ]
        }
        return jsonify(data)
    except Exception:
        # Fallback simples se ocorrer erro com o DB
        data = {
            "labels": ["A prazo", "Pix", "Cartão", "Dinheiro"],
            "datasets": [
                {
                    "data": [0, 0, 0, 0],
                    "backgroundColor": ["#4dc9f6", "#f67019", "#f53794", "#537bc4"]
                }
            ],
            "summary": {"status": "Falha ao acessar entregas; retornando zeros."}
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


@api_bp.route('/entregas/<int:entrega_id>/retirar', methods=['POST'])
def api_entrega_retirar(entrega_id):
    """Atribui a entrega ao usuário logado (encarregado) e baixa o estoque.

    Momento da baixa de estoque: quando o usuário "retira" o pedido para entrega.

    Regras:
      - Requer sessão com user_name.
      - Se entrega já tiver encarregado diferente, retorna 409.
      - Se encarregado estiver vazio ou igual ao usuário, tenta atribuir e baixar estoque.
      - Campo produto da entrega é uma string no formato "agua:2, p45:1".
    """

    def _parse_produtos(produto_str):
        """Converte a string de produtos em um dicionário de quantidades.

        Exemplo de entrada: "agua:2, p45:1" -> {"agua": 2, "p45": 1}
        Ignora partes vazias e quantidades inválidas (<=0).
        """
        result = {}
        if not produto_str:
            return result
        for part in produto_str.split(','):
            part = part.strip()
            if not part:
                continue
            if ':' not in part:
                continue
            tipo, qtd_str = part.split(':', 1)
            tipo = (tipo or '').strip().lower()
            qtd_str = (qtd_str or '').strip()
            if not tipo or not qtd_str:
                continue
            try:
                qtd = int(qtd_str)
            except ValueError:
                continue
            if qtd <= 0:
                continue
            # acumula se houver repetição do mesmo tipo
            result[tipo] = result.get(tipo, 0) + qtd
        return result

    user_name = session.get('user_name')
    if not user_name:
        return jsonify({'error': 'Usuário não autenticado'}), 401
    try:
        from app import db
        from app.models.entregas import Entrega
        from app.models.estoque import Estoque

        entrega = Entrega.query.get(entrega_id)
        if not entrega:
            return jsonify({'error': 'Entrega não encontrada'}), 404

        # Se já atribuída a outro usuário, não permite retirar
        if entrega.encarregado and entrega.encarregado != user_name:
            return jsonify({'error': 'Entrega já atribuída', 'encarregado': entrega.encarregado}), 409

        # Carrega registro de estoque
        estoque = Estoque.query.first()
        if not estoque:
            return jsonify({'error': 'Estoque não configurado'}), 500

        # Se a entrega já estiver atribuída ao mesmo usuário, não baixa estoque de novo
        if entrega.encarregado == user_name:
            return jsonify({'ok': True, 'entrega': entrega.to_dict(), 'warning': 'Entrega já atribuída a este usuário. Nenhuma nova baixa de estoque executada.'})

        itens = _parse_produtos(entrega.produto)

        # Mapeia chaves de produto para campos do modelo Estoque
        campo_map = {
            'p45': 'p45',
            'p20': 'p20',
            'p13': 'p13',
            'p8': 'p8',
            'p5': 'p5',
            'agua': 'agua',
        }

        # Validação de estoque suficiente
        for tipo, qtd in itens.items():
            campo = campo_map.get(tipo)
            if not campo:
                # Produto desconhecido, ignora na baixa mas avisa
                continue
            atual = getattr(estoque, campo) or 0
            if atual < qtd:
                return jsonify({'error': f'Estoque insuficiente para {tipo}. Disponível: {atual}, necessário: {qtd}'}), 400

        # Aplica baixa
        for tipo, qtd in itens.items():
            campo = campo_map.get(tipo)
            if not campo:
                continue
            atual = getattr(estoque, campo) or 0
            setattr(estoque, campo, atual - qtd)

        # Atribui entrega ao usuário
        entrega.encarregado = user_name

        db.session.commit()
        return jsonify({'ok': True, 'entrega': entrega.to_dict()})
    except Exception as e:
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({'error': 'Falha ao retirar entrega', 'detail': str(e)}), 500


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
