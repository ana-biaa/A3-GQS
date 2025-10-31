from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Instância do DB que será usada em todo o app
db = SQLAlchemy()


def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object('app.config.Config')
    db.init_app(app)

    with app.app_context():
        # registrar blueprints
        from .controllers.auth import auth_bp
        from .controllers.dashboard import dashboard_bp
        from .controllers.api import api_bp

        app.register_blueprint(auth_bp)
        app.register_blueprint(dashboard_bp)
        app.register_blueprint(api_bp)

        return app
