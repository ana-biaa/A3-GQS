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
