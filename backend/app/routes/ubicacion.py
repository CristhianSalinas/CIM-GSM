from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.ubicacion import obtener_ubicaciones
from app.schemas.ubicacion import UbicacionRespuesta


router = APIRouter(
    prefix="/api/Ubicaciones",
    tags=["Ubicaciones"]
)


@router.get("/", response_model=list[UbicacionRespuesta])
def listar_Ubicaciones(db: Session = Depends(get_db)):
    return obtener_ubicaciones(db)