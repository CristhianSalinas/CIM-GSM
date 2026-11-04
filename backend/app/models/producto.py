from sqlalchemy import VARCHAR, Column, Integer, String, Float
from app.config.database import Base


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)
    codigo_sm = Column(String(255), unique=True, nullable=False)
    nombre = Column("Nombre", String(45), nullable=False)
    id_marca = Column(Integer, nullable=False)
    descripcion = Column(String(45))
    referencia = Column(String(45))
    peso = Column(Float)
    precio = Column(Integer)
    cantidad_fisica = Column("Cantidad_fisica", Integer, default=0)
    #categoria = Column(String(100))


