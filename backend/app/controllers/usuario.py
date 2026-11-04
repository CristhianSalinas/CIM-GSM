from sqlalchemy.orm import Session
from app.models.usuario import Usuario


def obtener_usuarios(db: Session):
    return db.query(Usuario).all()