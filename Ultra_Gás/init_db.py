from app import create_app, db
from app.models.users import User
from app.models.estoque import Estoque
from app.models.metodosPagamento import MetodosPagamento
from app.models.clientes import Cliente
from app.models.entregas import Entrega
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

        # Cria alguns clientes de teste se não existirem
        if not Cliente.query.first():
            clientes_amostra = [
                Cliente(endereco='Rua das Flores, 123'),
                Cliente(endereco='Avenida Brasil, 1575'),
                Cliente(endereco='Rua dos Pinheiros, 900'),
                Cliente(endereco='Alameda Santos, 300'),
                Cliente(endereco='Travessa das Palmeiras, 12')
            ]
            db.session.add_all(clientes_amostra)
            db.session.commit()
            print('Clientes de teste criados')
        else:
            print('Clientes já existem')

        # Cria algumas entregas de teste se não existirem
        if not Entrega.query.first():
            entregas_amostra = [
                Entrega(endereco='Avenida Paulista, 1000', destinatario='Maria', produto='p20:1', metodo_pagamento='pix'),
                Entrega(endereco='Rua das Acácias, 45', destinatario='Pedro', produto='p13:2', metodo_pagamento='cartao'),
                Entrega(endereco='Praça Central, 10', destinatario='Ana', produto='p5:1, agua:1', metodo_pagamento='dinheiro'),
                Entrega(endereco='Rua do Sol, 220', destinatario='João', produto='p45:1', metodo_pagamento='a_prazo'),
                Entrega(endereco='Avenida Brasil, 1575', destinatario='Clara', produto='p20:2', metodo_pagamento='pix'),
                Entrega(endereco='Rua das Flores, 88', destinatario='Ricardo', produto='p8:1', metodo_pagamento='dinheiro'),
                Entrega(endereco='Travessa das Palmeiras, 12', destinatario='Beatriz', produto='p13:1', metodo_pagamento='cartao'),
                Entrega(endereco='Avenida Independência, 501', destinatario='Lucas', produto='p5:3', metodo_pagamento='pix'),
                Entrega(endereco='Rua São João, 340', destinatario='Fernanda', produto='agua:2, p45:1', metodo_pagamento='dinheiro'),
                Entrega(endereco='Praça das Nações, 7', destinatario='Eduardo', produto='p20:1', metodo_pagamento='cartao')
            ]
            db.session.add_all(entregas_amostra)
            db.session.commit()
            print('Entregas de teste criadas')
        else:
            print('Entregas já existem')


if __name__ == '__main__':
    init_test_users()
