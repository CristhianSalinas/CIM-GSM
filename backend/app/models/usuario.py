from sqlalchemy import Column, Integer, String,ForeignKey
from app.config.database import Base


class Usuario(Base):
    __tablename__ = "Usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    id_tipo_documento = Column(Integer, ForeignKey("tipo_documento.id_tipo"), nullable=False)  
    numero_documento = Column(String(20), nullable=False)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    direccion = Column(String(100))
    telefono = Column(String(20))



