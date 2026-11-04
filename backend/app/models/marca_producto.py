from sqlalchemy import VARCHAR, Column, Integer, String, Float
from app.config.database import Base


class MarcaProducto(Base):
    __tablename__ = "marca_producto"

    id_marca = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)


