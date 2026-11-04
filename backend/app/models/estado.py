from sqlalchemy import VARCHAR, Column, Integer, String, Float
from app.config.database import Base


class Estado(Base):
    __tablename__ = "estado"

    id_estado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)

