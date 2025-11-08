from app import create_app, db
from app.models.users import User
from app.models.estoque import Estoque
from app.models.metodosPagamento import MetodosPagamento
from werkzeug.security import generate_password_hash


def init_test_users():
    """Garante que as tabelas existam e cria usuários de teste se não existirem."""
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

        # Cria um registro de estoque para testes se não existir
        if not Estoque.query.first():
            sample = Estoque(
                p45=40,
                p20=20,
                p13=13,
                p8=8,
                p5=5,
                agua=15
            )
            db.session.add(sample)
            db.session.commit()
            print('Estoque de teste criado (soma <= 250)')
        else:
            print('Registro de estoque já existe')

        # Cria registro de metodos de pagamento para testes se não existir
        if not MetodosPagamento.query.first():
            mp = MetodosPagamento(
                a_prazo=40,
                pix=25,
                cartao=20,
                dinheiro=15
            )
            db.session.add(mp)
            db.session.commit()
            print('Registro de métodos de pagamento criado (teste)')
        else:
            print('Registro de métodos de pagamento já existe')


if __name__ == '__main__':
    init_test_users()
