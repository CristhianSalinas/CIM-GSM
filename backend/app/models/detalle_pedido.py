from sqlalchemy import VARCHAR, Column, Integer, ForeignKey, CheckConstraint
from app.config.database import Base


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    __table_args__ = (
        CheckConstraint(
            "cantidad_solicitada > 0",
            name="chk_cantidad_solicitada"
        ),
        CheckConstraint(
            "cantidad_despachada >= 0",
            name="chk_cantidad_despachada_positiva"
        ),
        CheckConstraint(
            "cantidad_despachada <= cantidad_solicitada",
            name="chk_cantidad_despachada_maxima"
        ),
    )

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), nullable=False)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), nullable=False)
    cantidad_solicitada = Column(Integer, nullable=False)
    cantidad_despachada = Column(Integer, nullable=False, default=0)
    




