
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func
)

from app.config.database import Base


class DetalleInventario(Base):
    __tablename__ = "detalle_inventario"

    id_detalle_inventario = Column(Integer, primary_key=True, index=True)

    id_inventario = Column(
        Integer,
        ForeignKey("inventarios.id_inventario")
    )

    id_producto = Column(
        Integer,
        ForeignKey("producto.id_producto")
    )

    id_estado = Column(
        Integer,
        ForeignKey("estado.id_estado")
    )

    cantidad_anterior = Column(Integer, nullable=False)

    cantidad_contada = Column(Integer, nullable=False)

    diferencia = Column(Integer, nullable=False)

    observacion = Column(String(150), nullable=True)
