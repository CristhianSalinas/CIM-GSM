from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, String
from app.config.database import Base


class Movimientos(Base):
    __tablename__ = "historial_movimientos"

    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"))
    id_movimentos = Column(Integer, ForeignKey("salida_entrada.id"))
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"))
    id_producto = Column(Integer, ForeignKey("producto.id_producto"))
    id_estado  = Column(Integer, ForeignKey("estado.id_estado"))
    id_inventario = Column(Integer, ForeignKey("inventarios.id_inventario"))
    cantidad = Column(Integer)
    fecha = Column(DateTime, server_default=func.now())
    observacion = Column(String)
    




