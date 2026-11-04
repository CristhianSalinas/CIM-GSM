from sqlalchemy.orm import Session
from app.models.pedido import Pedido


def obtener_pedidos(db: Session):
    return db.query(Pedido).all()