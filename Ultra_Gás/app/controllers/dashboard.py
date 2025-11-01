from flask import Blueprint, render_template, session, redirect, url_for, jsonify


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
    # Simulated data for demonstration purposes
    entrega_data = {
        "endereco": "Rua das Flores, 123",
        "destinatario": "João"
    }
    return entrega_data


@dashboard_bp.route('/entregas-pendentes', methods=['GET'])
def get_entregas_pendentes():
    """Rota que retorna uma lista de entregas pendentes (dados simulados).

    Cada item contém os campos: endereco, destinatario
    """
    entregas = [
        {"endereco": "Avenida Paulista, 1000", "destinatario": "Maria"},
        {"endereco": "Rua das Acácias, 45", "destinatario": "Pedro"},
        {"endereco": "Praça Central, 10", "destinatario": "Ana"},
        {"endereco": "Rua do Sol, 220", "destinatario": "João"},
        {"endereco": "Avenida Brasil, 1575", "destinatario": "Clara"},
        {"endereco": "Rua das Flores, 88", "destinatario": "Ricardo"},
        {"endereco": "Travessa das Palmeiras, 12", "destinatario": "Beatriz"},
        {"endereco": "Avenida Independência, 501", "destinatario": "Lucas"},
        {"endereco": "Rua São João, 340", "destinatario": "Fernanda"},
        {"endereco": "Praça das Nações, 7", "destinatario": "Eduardo"},
        {"endereco": "Rua dos Pinheiros, 900", "destinatario": "Sofia"},
        {"endereco": "Alameda Santos, 300", "destinatario": "Carla"},
        {"endereco": "Rua XV de Novembro, 240", "destinatario": "André"},
        {"endereco": "Rua Bela Vista, 67", "destinatario": "Patrícia"},
        {"endereco": "Avenida Atlântica, 1902", "destinatario": "Marcelo"},
        {"endereco": "Rua das Amendoeiras, 15", "destinatario": "Juliana"},
        {"endereco": "Estrada Velha, 1800", "destinatario": "Roberto"},
        {"endereco": "Rua do Comércio, 78", "destinatario": "Camila"},
        {"endereco": "Rua Nova Esperança, 55", "destinatario": "Felipe"},
        {"endereco": "Avenida das Nações, 120", "destinatario": "Isabela"}
    ]
    return jsonify(entregas)


@dashboard_bp.route('/historico-entregas', methods=['GET'])
def get_historico_entregas():
    """Rota que retorna histórico de entregas (dados simulados).

    Cada item contém os campos: endereco, destinatario
    """
    historico = [
        {"endereco": "Rua das Flores, 123", "destinatario": "João"},
        {"endereco": "Avenida Brasil, 1575", "destinatario": "Clara"},
        {"endereco": "Rua dos Pinheiros, 900", "destinatario": "Sofia"},
        {"endereco": "Alameda Santos, 300", "destinatario": "Carla"},
        {"endereco": "Rua Bela Vista, 67", "destinatario": "Patrícia"},
        {"endereco": "Estrada Velha, 1800", "destinatario": "Roberto"},
        {"endereco": "Praça das Nações, 7", "destinatario": "Eduardo"},
        {"endereco": "Rua dos Pinheiros, 900", "destinatario": "Sofia"},
        {"endereco": "Alameda Santos, 300", "destinatario": "Carla"},
        {"endereco": "Rua XV de Novembro, 240", "destinatario": "André"},
        {"endereco": "Rua Bela Vista, 67", "destinatario": "Patrícia"},
        {"endereco": "Avenida Atlântica, 1902", "destinatario": "Marcelo"},
        {"endereco": "Rua das Amendoeiras, 15", "destinatario": "Juliana"},
        {"endereco": "Estrada Velha, 1800", "destinatario": "Roberto"},
        {"endereco": "Rua do Comércio, 78", "destinatario": "Camila"},
        {"endereco": "Rua Nova Esperança, 55", "destinatario": "Felipe"},
        {"endereco": "Avenida das Nações, 120", "destinatario": "Isabela"}
    ]
    return jsonify(historico)


@dashboard_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Rota que retorna uma lista de clientes (dados simulados).

    Cada item contém o campo: endereco
    """
    clientes = [
        {"endereco": "Rua das Flores, 123"},
        {"endereco": "Avenida Paulista, 1000"},
        {"endereco": "Rua das Acácias, 45"},
        {"endereco": "Praça Central, 10"},
        {"endereco": "Avenida Brasil, 1575"},
        {"endereco": "Rua das Flores, 88"},
        {"endereco": "Travessa das Palmeiras, 12"},
        {"endereco": "Rua dos Pinheiros, 321"},
        {"endereco": "Avenida Atlântica, 500"},
        {"endereco": "Rua São João, 245"},
        {"endereco": "Rua Bela Vista, 87"},
        {"endereco": "Avenida Rio Branco, 900"},
        {"endereco": "Rua Dom Pedro II, 56"},
        {"endereco": "Travessa das Margaridas, 33"},
        {"endereco": "Rua XV de Novembro, 712"},
        {"endereco": "Avenida Independência, 1020"},
        {"endereco": "Rua das Oliveiras, 402"},
        {"endereco": "Praça da Liberdade, 15"},
        {"endereco": "Rua Coronel Franco, 276"},
        {"endereco": "Avenida do Contorno, 1500"},
        {"endereco": "Rua Santa Clara, 640"},
        {"endereco": "Alameda dos Ipês, 78"},
        {"endereco": "Rua Professor Lima, 99"},
        {"endereco": "Rua do Comércio, 312"},
        {"endereco": "Avenida Europa, 1200"},
        {"endereco": "Rua General Osório, 455"},
        {"endereco": "Rua Monte Alegre, 800"},
        {"endereco": "Avenida das Américas, 2055"},
        {"endereco": "Rua Tiradentes, 507"},
        {"endereco": "Travessa dos Lírios, 41"}
    ]
    return jsonify(clientes)


@dashboard_bp.route('/cards', methods=['GET'])
def get_dashboard_cards():
    """Rota que retorna os valores exibidos nos cartões da seção principal (dashboard-cards).

    Campos retornados (simulados):
      - pedidos_pendentes: número
      - vendas_do_dia: número
      - entregadores_em_rota: número
      - status_estoque_percent: número (percentual)
    """
    data = {
        "pedidos_pendentes_num": 24,
        "vendas_do_dia_num": 57,
        "entregadores_em_rota_num": 8,
        "status_estoque_percent_num": 92
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
