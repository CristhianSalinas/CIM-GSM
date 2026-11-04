from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.tipo_documento import obtener_tipos_documento
from app.schemas.tipo_documento import TipoDocumentoRespuesta


router = APIRouter(
    prefix="/api/tipos-documento",
    tags=["Tipos de Documento"]
)


@router.get("/", response_model=list[TipoDocumentoRespuesta])
def listar_tipos_documento(db: Session = Depends(get_db)):
    return obtener_tipos_documento(db)