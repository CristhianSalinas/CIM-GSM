from sqlalchemy import VARCHAR, Column, Integer, String, Float,ForeignKey
from app.config.database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    id_tipo_documento = Column(Integer, ForeignKey("tipo_documento.id_tipo"), nullable=False)  
    numero_documento = Column(String(20), unique=True, nullable=False)
    nombre = Column(String(50), nullable=False)
    apellidos = Column(String(50), nullable=False)
    direccion = Column(String(100))
    telefono = Column(String(20))



