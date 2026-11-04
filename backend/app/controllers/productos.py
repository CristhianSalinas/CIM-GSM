from sqlalchemy.orm import Session
from app.models.producto import Producto


def obtener_productos(db: Session):
    return db.query(Producto).all()