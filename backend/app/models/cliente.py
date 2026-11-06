from sqlalchemy import Column, ForeignKey, Integer, String
from app.config.database import Base


class Cliente(Base):
    __tablename__ = "Cliente"

    id_cliente = Column(Integer, primary_key=True, index=True)
    id_tipo_documento = Column(
            String(20),
            ForeignKey("tipo_documento.id_tipo"),
            nullable=False
        )
    numero_documento = Column(String(20), nullable=False)
    nombre = Column(String(45), nullable=False)
    apellidos = Column(String(45), nullable=False)
    direccion = Column(String(45))
    telefono = Column(String(20))







