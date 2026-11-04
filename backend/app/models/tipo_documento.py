from sqlalchemy import VARCHAR, Column, Integer, String, Float
from app.config.database import Base


class TipoDocumento(Base):
    __tablename__ = "tipo_documento"

    id_tipo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)