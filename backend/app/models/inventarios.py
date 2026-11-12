
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func
)

from app.config.database import Base


class Inventarios(Base):
    __tablename__ = "inventarios"

    id_inventario = Column(Integer, primary_key=True, index=True)

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario"),
        nullable=True
    )

    id_ubicacion = Column(
        Integer,
        ForeignKey("ubicacion.id_ubicacion"),
        nullable=True
    )

    id_producto = Column(
        Integer,
        ForeignKey("producto.id_producto"),
        nullable=True
    )

    id_categoria = Column(
        Integer,
        ForeignKey("categorias.id_categoria"),
        nullable=True
    )

    id_estado = Column(
        Integer,
        ForeignKey("estado.id_estado"),
        nullable=True
    )

    cantidad_anterior = Column(Integer, nullable=False)

    cantidad_contada = Column(Integer, nullable=False)

    diferencia = Column(Integer, nullable=False)

    fecha = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    observacion = Column(String(150), nullable=True)
