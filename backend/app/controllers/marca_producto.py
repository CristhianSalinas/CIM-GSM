from sqlalchemy.orm import Session
from app.models.marca_producto import MarcaProducto


def obtener_marcas(db: Session):
    return db.query(MarcaProducto).all()