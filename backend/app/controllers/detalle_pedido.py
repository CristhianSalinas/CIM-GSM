from sqlalchemy.orm import Session
from app.models.detalle_pedido import DetallePedido


def obtener_detalle(db: Session):
    return db.query(DetallePedido).all()