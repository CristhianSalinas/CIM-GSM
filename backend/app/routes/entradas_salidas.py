from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.entradas_salidas import obtener_entrada_salida, crear_entrada_salida
from app.schemas.entradas_salidas import Entrada_salidaCrear, Entrada_salidaRespuesta



router = APIRouter(
    prefix="/api/entradas_salidas",
    tags=["Entradas y Salidas"]
)


@router.get("/", response_model=list[Entrada_salidaRespuesta])
def listar_entradas_salidas(db: Session = Depends(get_db)):
    return obtener_entrada_salida(db)