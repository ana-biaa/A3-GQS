from flask import Blueprint, render_template, session, redirect, url_for


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
