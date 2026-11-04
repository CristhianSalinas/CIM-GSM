from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.marca_producto import obtener_marcas
from app.schemas.marca_producto import MarcaRespuesta


router = APIRouter(
    prefix="/api/marcas",
    tags=["Marcas"]
)


@router.get("/", response_model=list[MarcaRespuesta])
def listar_marcas(db: Session = Depends(get_db)):
    return obtener_marcas(db)