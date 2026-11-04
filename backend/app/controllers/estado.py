from sqlalchemy.orm import Session
from app.models.estado import Estado


def obtener_estados(db: Session):
    return db.query(Estado).all()