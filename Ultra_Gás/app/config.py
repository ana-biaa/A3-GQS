class Config:
    SECRET_KEY = 'dev-secret-key'
    # Para protótipo usamos SQLite local. Se quiser MySQL, altere a URI.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
