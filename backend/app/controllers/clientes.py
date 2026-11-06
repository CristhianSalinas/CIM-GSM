from sqlalchemy.orm import Session
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCrear


def obtener_cliente(db: Session):
    return db.query(Cliente).all()

def crear_cliente(db: Session, datos:ClienteCrear):
    nuevo_cliente = Cliente(**datos.model_dump())

    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return nuevo_cliente