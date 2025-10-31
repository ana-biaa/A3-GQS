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
    data = {
        "summary": {"statusText": "Mock: estoque equilibrado — itens com baixa quantidade: 3"},
        "pie": {
            "p45": 40,
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
