from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.config.database import Base


class DetalleInventario(Base):
    __tablename__ = "detalle_inventario"

    id_detalle_inventario = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    id_inventario = Column(
        Integer,
        ForeignKey("inventarios.id_inventario"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("producto.id_producto"),
        nullable=False
    )

    cantidad_anterior = Column(Integer, nullable=False)
    cantidad_actual = Column(Integer, nullable=False)
    diferencia = Column(Integer, nullable=False)

    observacion = Column(String(255), nullable=True)

    fecha = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )