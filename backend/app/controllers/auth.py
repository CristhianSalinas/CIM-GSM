from sqlalchemy.orm import Session
from app.models.usuario import Usuario


def autenticar_usuario(db: Session, usuario: str):
    return db.query(Usuario).filter(
        Usuario.usuario == usuario
    ).first()