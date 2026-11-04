from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.estado import obtener_estados
from app.schemas.estado import EstadoRespuesta


router = APIRouter(
    prefix="/api/estados",
    tags=["Estados"]
)


@router.get("/", response_model=list[EstadoRespuesta])
def listar_estados(db: Session = Depends(get_db)):
    return obtener_estados(db)