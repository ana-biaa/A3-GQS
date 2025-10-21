from app import create_app, db


def create_database():
    """Cria todas as tabelas do banco de dados dentro do app context."""
    app = create_app()
    with app.app_context():
        db.create_all()
        print('Banco criado (ou já existente)')


if __name__ == '__main__':
    create_database()
