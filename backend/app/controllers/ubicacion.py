from sqlalchemy.orm import Session
from app.models.ubicacion import Ubicacion


def obtener_ubicaciones(db: Session):
    return db.query(Ubicacion).all()