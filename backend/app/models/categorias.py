from sqlalchemy import Column, ForeignKey, Integer, String
from app.config.database import Base


class Categorias(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)







