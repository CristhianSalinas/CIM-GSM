from sqlalchemy.orm import Session
from app.models.producto import Producto
from sqlalchemy import func


def obtener_productos(db: Session):
    return db.query(Producto).all()

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
        "Stock_Bajo" : productos_sin_stock,
        "Agotados" : agotados
    }