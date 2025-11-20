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
    # método de pagamento permitido: 'pix', 'a_prazo', 'cartao', 'dinheiro'
    metodo_pagamento = db.Column(db.String(32), nullable=True)
    # novos campos
    encarregado = db.Column(db.String(120), nullable=True, default='', server_default='')  # inicia vazio
    entregue = db.Column(db.Boolean, nullable=False, default=False, server_default='0')     # inicia False
    pago = db.Column(db.Boolean, nullable=False, default=False, server_default='0')          # inicia False
    # novo campo de preço total do pedido (string formatada ou valor simples) inicia vazio
    preco = db.Column(db.String(32), nullable=True, default='', server_default='')

    # Constraint simples para garantir que, quando informado, o método esteja entre os permitidos.
    # Observe: se mudar os valores permitidos, atualize também esta expressão.
    __table_args__ = (
      db.CheckConstraint("metodo_pagamento IN ('pix','a_prazo','cartao','dinheiro') OR metodo_pagamento IS NULL", name='ck_entrega_metodo_pagamento'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'endereco': self.endereco,
            'destinatario': self.destinatario,
            'produto': self.produto,
            'metodo_pagamento': self.metodo_pagamento,
            'encarregado': self.encarregado,
            'entregue': self.entregue,
            'pago': self.pago,
            'preco': self.preco
        }
