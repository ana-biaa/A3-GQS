from app import db
from sqlalchemy import CheckConstraint

# Capacidade padrão do estoque (número máximo de itens somados entre todas as categorias).
# Este valor é usado para calcular porcentagens e documentar o limite aplicado pela constraint.
# Atenção: a CheckConstraint da tabela usa um literal (250). Se você alterar esta constante,
# deverá também atualizar a constraint na definição da tabela (e aplicar migração ou recriar a tabela)
# para que o banco de dados passe a validar o novo limite.
DEFAULT_CAPACITY = 250


class Estoque(db.Model):
    __tablename__ = 'estoque'

    id = db.Column(db.Integer, primary_key=True)
    p45 = db.Column(db.Integer, nullable=False, default=0)
    p20 = db.Column(db.Integer, nullable=False, default=0)
    p13 = db.Column(db.Integer, nullable=False, default=0)
    p8 = db.Column(db.Integer, nullable=False, default=0)
    p5 = db.Column(db.Integer, nullable=False, default=0)
    agua = db.Column(db.Integer, nullable=False, default=0)

    # Constraint de banco que garante que a soma de todos os campos do estoque
    # não ultrapasse a capacidade máxima (atualmente 250).
    # Nota: a expressão da constraint precisa ser alterada manualmente se modificar
    # DEFAULT_CAPACITY (veja comentário acima).
    __table_args__ = (
        CheckConstraint('p45 + p20 + p13 + p8 + p5 + agua <= 250', name='ck_estoque_total_max'),
    )

    def total(self):
        """Retorna a soma de todos os itens do estoque."""
        return int((self.p45 or 0) + (self.p20 or 0) + (self.p13 or 0) + (self.p8 or 0) + (self.p5 or 0) + (self.agua or 0))

    def percent(self, capacity: int = DEFAULT_CAPACITY):
        """Retorna o percentual ocupado do estoque (arredondado)."""
        if capacity <= 0:
            return 0
        total = self.total()
        return round((total / capacity) * 100)

    def to_pie(self):
        """Retorna um dicionário adequado para alimentar o gráfico pie."""
        return {
            'p45': int(self.p45 or 0),
            'p20': int(self.p20 or 0),
            'p13': int(self.p13 or 0),
            'p8': int(self.p8 or 0),
            'p5': int(self.p5 or 0),
            'agua': int(self.agua or 0),
        }
