from app import db


class Entrega(db.Model):
    """Modelo para representar entregas pendentes/histórico.

    Campos:
      - id
      - endereco
      - destinatario
      - produto (string resumida, ex.: "agua:2, p45:1")
    """

    __tablename__ = 'entregas'

    id = db.Column(db.Integer, primary_key=True)
    endereco = db.Column(db.String(255), nullable=False)
    destinatario = db.Column(db.String(120), nullable=False)
    produto = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'endereco': self.endereco,
            'destinatario': self.destinatario,
            'produto': self.produto
        }
