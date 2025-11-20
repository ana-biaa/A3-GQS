from flask import Blueprint, render_template, session, redirect, url_for, jsonify
from app import db
from app.models.estoque import Estoque
from app.models.clientes import Cliente
from app.models.entregas import Entrega

# Nota: o limite máximo do estoque (capacidade) está definido em
# `app/models/estoque.py` como DEFAULT_CAPACITY (atualmente 250).
# A constraint no banco (ck_estoque_total_max) também impõe que a soma dos
# campos p45+p20+p13+p8+p5+agua não ultrapasse esse limite. Se quiser alterar
# a capacidade, atualize DEFAULT_CAPACITY e ajuste a constraint no modelo/banco.


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')


@dashboard_bp.route('/', methods=['GET'])
def show_dashboard():
    user_type = session.get('user_type')
    if not user_type:
        return redirect(url_for('auth.index'))

    user_name = session.get('user_name', 'Usuário')

    if user_type == 'admin':
        return render_template('dashboard_admin.html', user_name=user_name)
    else:
        return render_template('dashboard.html', user_name=user_name)


@dashboard_bp.route('/entrega-atual', methods=['GET'])
def get_entrega_atual():
    """Retorna lista de entregas atribuídas ao usuário logado (encarregado == nome) e ainda não entregues.

    Se não houver sessão ou nenhuma entrega, retorna fallback com um exemplo.
    """
    user_name = session.get('user_name')
    if not user_name:
        return jsonify([])
    try:
        entregas = Entrega.query.filter(Entrega.encarregado == user_name, Entrega.entregue.is_(False)).all()
        return jsonify([e.to_dict() for e in entregas])
    except Exception:
        # Fallback: um exemplo com preco
        return jsonify([
            {
                'id': 999,
                'endereco': 'Rua Exemplo, 100',
                'destinatario': 'Destinatário Exemplo',
                'produto': 'p20:1, agua:1',
                'metodo_pagamento': 'pix',
                'encarregado': user_name,
                'entregue': False,
                'pago': False,
                'preco': '210'
            }
        ])


@dashboard_bp.route('/entregas-pendentes', methods=['GET'])
def get_entregas_pendentes():
    """Rota que retorna uma lista de entregas pendentes (dados simulados).

    Cada item contém os campos: endereco, destinatario
    """
    try:
        # pendentes: encarregado vazio e entregue == False
        entregas = Entrega.query.filter(Entrega.encarregado == '', Entrega.entregue.is_(False)).all()
        result = [e.to_dict() for e in entregas]
        return jsonify(result)
    except Exception:
        # Fallback inclui todos os campos, inclusive preco
        entregas = [
            {"endereco": "Rua São João, 340", "destinatario": "Fernanda", "produto": "agua:2, p45:1", "metodo_pagamento": "dinheiro", "encarregado": "", "entregue": False, "pago": False, "preco": "420"}
        ]
        return jsonify(entregas)


@dashboard_bp.route('/historico-entregas', methods=['GET'])
def get_historico_entregas():
    """Rota que retorna histórico de entregas (dados simulados).

    Cada item contém os campos: endereco, destinatario
    """
    try:
        # histórico: entregue True e pago True
        historico_db = Entrega.query.filter(Entrega.entregue.is_(True), Entrega.pago.is_(True)).all()
        return jsonify([e.to_dict() for e in historico_db])
    except Exception:
        historico = [
            {"endereco": "Rua das Flores, 123", "destinatario": "João", "produto": "p13:1", "metodo_pagamento": "pix", "encarregado": "Carlos", "entregue": True, "pago": True, "preco": "130"}
        ]
        return jsonify(historico)


@dashboard_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Rota que retorna uma lista de clientes (dados simulados).

    Cada item contém o campo: endereco
    """
    try:
        clientes = Cliente.query.all()
        result = [c.to_dict() for c in clientes]
        return jsonify(result)
    except Exception:
        # Se houver qualquer erro com o DB, usar fallback simples
        fallback = [{"endereco": "Rua das Flores, 123"}]
        return jsonify(fallback)


@dashboard_bp.route('/cards', methods=['GET'])
def get_dashboard_cards():
    """Rota que retorna os valores exibidos nos cartões da seção principal (dashboard-cards).

    Campos retornados (simulados):
      - pedidos_pendentes: número
      - vendas_do_dia: número
      - entregadores_em_rota: número
      - status_estoque_percent: número (percentual)
    """
    # Tenta calcular o status do estoque a partir do registro no DB
    status_percent = 0
    try:
        estoque = Estoque.query.first()
        if estoque:
            status_percent = estoque.percent()
    except Exception:
        # se algo falhar, manter 0 e não bloquear a rota
        status_percent = 0

    data = {
        "pedidos_pendentes_num": 24,
        "vendas_do_dia_num": 57,
        "entregadores_em_rota_num": 8,
        "status_estoque_percent_num": int(status_percent)
    }
    return jsonify(data)


@dashboard_bp.route('/estoque-cards', methods=['GET'])
def get_estoque_cards():
    """Rota que retorna os valores exibidos nos cartões da seção Estoque/Financeiro (simulados).

    Campos retornados (simulados):
      - vendas_do_dia: string (R$ ...)
      - pagamentos: { recebidos: string (R$ ...), pendentes: string (R$ ...) }
    """
    data = {
        "vendas_do_dia_num": 1000,
        "pagamentos": {
            "recebidos_num": 800,
            "pendentes_num": 200
        }
    }
    return jsonify(data)
