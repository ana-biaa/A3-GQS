from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app import db
from app.models.users import User
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@auth_bp.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    user = User.query.filter_by(email=email).first()
    if not user:
        flash('Usuário não encontrado', 'danger')
        return redirect(url_for('auth.index'))

    if check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['user_type'] = user.user_type
        # salvar o nome do usuário na sessão para mostrar no template
        session['user_name'] = user.name
        return redirect(url_for('dashboard.show_dashboard'))
    else:
        flash('Senha incorreta', 'danger')
        return redirect(url_for('auth.index'))


@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.index'))
