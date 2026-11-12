from sqlalchemy.orm import Session
from app.models.rol import Rol


def obtener_rol(db: Session):
    return db.query(Rol).all()