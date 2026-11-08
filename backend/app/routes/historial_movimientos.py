from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.historial_movimientos import obtener_movimientos, registrar_movimientos, salida_movimientos
from app.schemas.historial_movimientos import MovimientosRespuesta, MovimientosCrear


router = APIRouter(
    prefix="/api/historial_movimientos",
    tags=["Historial Movimentos"]
)


@router.get("/", response_model=list[MovimientosRespuesta])
def listar_movimientos(db: Session = Depends(get_db)):
    return obtener_movimientos(db)

@router.post("/registrar")
def registrarmovimientos(
    datos: MovimientosCrear,
    db: Session = Depends(get_db)
    ):
    return registrar_movimientos(db, datos)


@router.post("/salida")
def Salidamovimientos(
    datos: MovimientosCrear,
    db: Session = Depends(get_db)
    ):
    return salida_movimientos(db, datos)