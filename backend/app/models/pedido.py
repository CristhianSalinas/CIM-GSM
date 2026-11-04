from sqlalchemy import VARCHAR, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.config.database import Base


class Pedido(Base):
    __tablename__ = "pedido"

    id_pedido = Column(Integer, primary_key=True, index=True)
    numero_pedido = Column(Integer, unique=True, nullable=False)
    id_cliente = Column(Integer, nullable=False)
    fecha = Column(DateTime, server_default=func.now(), nullable=False)
    id_estado = Column(Integer, ForeignKey("estado.id_estado"), nullable=False)


