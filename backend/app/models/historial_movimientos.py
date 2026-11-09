from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, String
from app.config.database import Base


class Movimientos(Base):
    __tablename__ = "historial_movimientos"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    id_movimentos = Column(Integer, ForeignKey("salida_entrada.id"))
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"))
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"))
    id_producto = Column(Integer, ForeignKey("producto.id_producto"))
    cantidad = Column(Integer, nullable=False)
    fecha = Column(DateTime, server_default=func.now(), nullable=False)
    observacion = Column(String)
    




