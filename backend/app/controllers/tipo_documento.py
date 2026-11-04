from sqlalchemy.orm import Session
from app.models.tipo_documento import TipoDocumento


def obtener_tipos_documento(db: Session):
    return db.query(TipoDocumento).all()