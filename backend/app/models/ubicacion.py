from sqlalchemy import Column, Integer,ForeignKey, DateTime, String
from sqlalchemy.sql import func
from app.config.database import Base


class Ubicacion(Base):
    __tablename__ = "ubicacion"

    id_ubicacion = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    zona = Column(String)
    estante = Column(String)
    nivel = Column(String)
    descripcion = Column(String)


