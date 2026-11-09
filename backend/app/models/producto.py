from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.config.database import Base


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)

    codigo_sm = Column(String(20), unique=True, nullable=False)

    nombre = Column("nombre", String(100), nullable=False)

    id_marca = Column(
        Integer,
        ForeignKey("marca_producto.id_marca"),
        nullable=True
    )

    descripcion = Column(String(255))
    referencia = Column(String(45))
    peso = Column(Float)
    precio = Column(Integer)
    cantidad_fisica = Column("cantidad_fisica", Integer, default=0)
