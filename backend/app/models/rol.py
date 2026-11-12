from sqlalchemy import Column, Integer, String
from app.config.database import Base

class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    Descripcion = Column(String(255))