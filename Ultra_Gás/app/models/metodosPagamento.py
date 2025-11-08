from app import db


class MetodosPagamento(db.Model):
    """Model para contabilizar quantidades de transações por método de pagamento.

    Campos (todos inteiros, representam contagem de transações):
      - a_prazo   => corresponde a 'A Prazo'
      - pix       => corresponde a 'PIX'
      - cartao    => corresponde a 'Cartão'
      - dinheiro  => corresponde a 'Dinheiro'

    Observação: esta tabela guarda apenas quantidades (contagem de transações),
    conforme solicitado — não guarda valores monetários.
    """

    __tablename__ = 'metodos_pagamento'

    id = db.Column(db.Integer, primary_key=True)
    a_prazo = db.Column(db.Integer, nullable=False, default=0)
    pix = db.Column(db.Integer, nullable=False, default=0)
    cartao = db.Column(db.Integer, nullable=False, default=0)
    dinheiro = db.Column(db.Integer, nullable=False, default=0)

    def as_list(self):
        """Retorna os valores em lista ordenada para uso em gráficos: [A prazo, Pix, Cartão, Dinheiro]."""
        return [int(self.a_prazo or 0), int(self.pix or 0), int(self.cartao or 0), int(self.dinheiro or 0)]

    def as_dict(self):
        """Retorna um dicionário com chaves legíveis."""
        return {
            'A prazo': int(self.a_prazo or 0),
            'Pix': int(self.pix or 0),
            'Cartão': int(self.cartao or 0),
            'Dinheiro': int(self.dinheiro or 0)
        }
