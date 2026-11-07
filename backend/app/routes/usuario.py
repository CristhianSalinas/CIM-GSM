from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.usuario import obtener_usuarios
from app.schemas.usuario import UsuarioRespuesta


router = APIRouter(
    prefix="/api/Usuarios",
    tags=["Usuarios"]
)


@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(get_db)):
    return obtener_usuarios(db)