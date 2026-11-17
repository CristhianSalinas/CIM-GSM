from sqlalchemy.orm import Session
from app.models.categorias import Categorias
from app.schemas.categorias import CategoriasCrear


def obtener_categoria(db: Session):
    return db.query(Categorias).all()

def crear_categoria(db: Session, datos:CategoriasCrear):
    nueva_categoria = Categorias(**datos.model_dump())

    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)

    return nueva_categoria