
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
        ForeignKey("usuario.id_usuario")
    )

    id_ubicacion = Column(
        Integer,
        ForeignKey("ubicacion.id_ubicacion")
    )

    id_categoria = Column(
        Integer,
        ForeignKey("categorias.id_categoria")
    )

    id_estado = Column(
        Integer,
        ForeignKey("estado.id_estado"),
    )

    fecha = Column(
        DateTime
    )

    observacion = Column(String(150))
