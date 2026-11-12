
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.config.database import Base


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)

    codigo_sm = Column(String(20), unique=True, nullable=True)

    nombre = Column("Nombre", String(100), nullable=True)

    id_marca = Column(
        Integer,
        ForeignKey("marca_producto.id_marca"),
        nullable=True
    )

    descripcion = Column(String(255), nullable=True)

    referencia = Column(String(45), nullable=True)

    peso = Column(Float, nullable=True)

    precio = Column(Integer, nullable=True)

    cantidad_fisica = Column(
        "Cantidad_fisica",
        Integer,
        nullable=True
    )

    id_ubicacion = Column(Integer, nullable=True)

    id_categoria = Column(Integer, nullable=True)
