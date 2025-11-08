from flask import Blueprint, jsonify


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
