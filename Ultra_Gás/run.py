from app import create_app

app = create_app()

if __name__ == '__main__':
    from createdb import create_database
    from init_db import init_test_users

    # Garantir DB e usuários de teste (funções idempotentes)
    create_database()
    init_test_users()

    app.run(debug=True)
