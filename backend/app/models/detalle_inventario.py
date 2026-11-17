from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.config.database import Base


class DetalleInventario(Base):
    __tablename__ = "detalle_inventario"

    id_detalles_inventario = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    cantidad_anterior = Column(Integer, nullable=False)
    cantidad_contada = Column(Integer, nullable=False)
    diferencia = Column(Integer, nullable=False)

    id_producto = Column(
            Integer,
            ForeignKey("producto.id_producto"),
            nullable=False
        )  

    id_inventario = Column(
        Integer,
        ForeignKey("inventarios.id_inventario"),
        nullable=False
    )

    id_estado =  Column(
        Integer,
        ForeignKey("estado.id_estado"),
        nullable=False
    )


    observacion = Column(String(255), nullable=True)
