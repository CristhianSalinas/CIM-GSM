from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.rol import obtener_rol
from app.schemas.rol import RolRespuesta


router = APIRouter(
    prefix="/api/rol",
    tags=["Rol"]
)


@router.get("/", response_model=list[RolRespuesta])
def listar_Rol(db: Session = Depends(get_db)):
    return obtener_rol(db)