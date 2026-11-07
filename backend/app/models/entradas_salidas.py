from sqlalchemy import Column, Integer, String
from app.config.database import Base


class Entrada_Salida(Base):
    __tablename__ = "salida_entrada"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(15), nullable=False)

