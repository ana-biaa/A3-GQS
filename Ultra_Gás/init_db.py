from app import create_app, db
from app.models.users import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    db.create_all()

    if not User.query.filter_by(email='admin@example.com').first():
        admin = User(
            name='Administrador',
            email='admin@example.com',
            password=generate_password_hash('admin123'),
            user_type='admin'
        )
        user = User(
            name='Usuário de Teste',
            email='user@example.com',
            password=generate_password_hash('user123'),
            user_type='user'
        )
        db.session.add(admin)
        db.session.add(user)
        db.session.commit()
        print('Usuário admin e usuário comum criados (admin@example.com/admin123, user@example.com/user123)')
    else:
        print('Usuários já existem')
