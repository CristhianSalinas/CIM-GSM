from sqlalchemy import  Column, Integer, String,  ForeignKey, DateTime, func
from app.config.database import Base


class Inventarios(Base):
    __tablename__ = "inventarios"

    id_inventario = Column(Integer, primary_key=True, index=True)
    id_usuario  = Column(Integer, ForeignKey("usuario.id_usuario"))
    id_ubicacion = Column(Integer, ForeignKey("ubicacion.id_ubicacion"))
    id_producto = Column(Integer, ForeignKey("producto.id_producto"))
    cantidad_anterior = Column(Integer, nullable=False)
    cantidad_contada = Column(Integer, nullable=False)
    diferencia = Column(Integer, nullable=False)
    fecha = Column(DateTime, server_default=func.now(), nullable=False)
    observacion = Column(String(150), nullable=False)
