from sqlalchemy import Column, Integer, String,ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from app.config.database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    id_tipo_documento = Column(Integer, ForeignKey("tipo_documento.id_tipo"), nullable=False)  
    numero_documento = Column(String(20), nullable=False)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    direccion = Column(String(100))
    telefono = Column(String(20))
    correo = Column(String(150), nullable=False)
    usuario = Column(String(50), nullable=False)
    password_hash = Column(String(255))
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False) 
    estado = Column (Boolean)
    fecha = Column(DateTime, server_default=func.now())




