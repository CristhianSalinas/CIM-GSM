from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.producto import Producto


def obtener_productos(db: Session, busqueda: str):
    termino = f"%{busqueda.strip()}%"

    return db.query(Producto).filter(
        or_(
            Producto.codigo_sm.ilike(termino),
            Producto.nombre.ilike(termino)
        )
    ).limit(50).all()


def obtener_estadisticas_productos(db: Session):

    total_productos = db.query(
        func.count(Producto.id_producto)
    ).scalar() or 0

    productos_sin_stock = db.query(
        func.count(Producto.id_producto)
    ).filter(
        Producto.cantidad_fisica <= 5,
        Producto.cantidad_fisica > 0
    ).scalar() or 0

    agotados = db.query(
        func.count(Producto.id_producto)
    ).filter(
        Producto.cantidad_fisica <= 0
    ).scalar() or 0

    return {
        "total_productos": total_productos,
        "Stock_Bajo": productos_sin_stock,
        "Agotados": agotados
    }