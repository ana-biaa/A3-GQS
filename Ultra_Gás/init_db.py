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

        # Função de cálculo de preço para entregas
        precos_unit = {
            'p45': 400,
            'p20': 200,
            'p13': 130,
            'p8': 100,
            'p5': 90,
            'agua': 10
        }

        def calcular_preco(produto_str: str) -> str:
            if not produto_str:
                return '0'
            total = 0
            for par in [p.strip() for p in produto_str.split(',') if p.strip()]:
                if ':' in par:
                    nome, qtd = par.split(':', 1)
                    try:
                        quantidade = int(qtd.strip())
                    except ValueError:
                        quantidade = 0
                    total += precos_unit.get(nome.strip().lower(), 0) * quantidade
            return str(total)

        # Cria algumas entregas de teste (inclui preco) se não existirem
        if not Entrega.query.first():
            dados_entregas = [
                # Pendentes (sem encarregado)
                ('Avenida Paulista, 1000','Maria','p20:1','pix','',False,False),
                ('Rua das Acácias, 45','Pedro','p13:2','cartao','',False,False),
                ('Praça Central, 10','Ana','p5:1, agua:1','dinheiro','',False,False),
                ('Rua do Sol, 220','João','p45:1','a_prazo','',False,False),
                ('Rua São João, 340','Fernanda','agua:2, p45:1','dinheiro','',False,False),
                # Atribuídas ao usuário de teste (Entrega Atual)
                ('Rua Alfa, 10','Cliente X','p20:1, agua:1','pix','Usuário de Teste',False,False),
                ('Rua Beta, 22','Cliente Y','p45:1','dinheiro','Usuário de Teste',False,False),
                ('Rua Gama, 33','Cliente Z','p13:2','cartao','Usuário de Teste',False,False),
                ('Rua Delta, 44','Cliente W','p5:1, p8:1','a_prazo','Usuário de Teste',False,False),
                # Em progresso (tem encarregado mas ainda não entregue/pago)
                ('Avenida Brasil, 1575','Clara','p20:2','pix','Equipe A',False,False),
                ('Rua das Flores, 88','Ricardo','p8:1','dinheiro','Equipe B',False,False),
                # Histórico (entregue e pago)
                ('Travessa das Palmeiras, 12','Beatriz','p13:1','cartao','Equipe A',True,True),
                ('Avenida Independência, 501','Lucas','p5:3','pix','Equipe C',True,True),
                ('Praça das Nações, 7','Eduardo','p20:1','cartao','Equipe B',True,True)
            ]
            entregas_objs = [
                Entrega(
                    endereco=e[0], destinatario=e[1], produto=e[2], metodo_pagamento=e[3],
                    encarregado=e[4], entregue=e[5], pago=e[6], preco=calcular_preco(e[2])
                ) for e in dados_entregas
            ]
            db.session.add_all(entregas_objs)
            db.session.commit()
            print('Entregas de teste criadas com campo preco')
        else:
            print('Entregas já existem')

if __name__ == '__main__':
    init_test_users()
