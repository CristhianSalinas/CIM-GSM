from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.clientes import obtener_cliente
from app.schemas.cliente import ClienteRespuesta


router = APIRouter(
    prefix="/api/clientes",
    tags=["Clientes"]
)


@router.get("/", response_model=list[ClienteRespuesta])
def listar_clientes(db: Session = Depends(get_db)):
    return obtener_cliente(db)