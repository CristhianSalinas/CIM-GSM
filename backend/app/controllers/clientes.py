from sqlalchemy.orm import Session
from app.models.cliente import Cliente


def obtener_cliente(db: Session):
    return db.query(Cliente).all()