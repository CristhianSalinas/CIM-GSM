from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.usuario import obtener_usuarios
from app.schemas.usuario import UsuarioRespuesta
from app.models.usuario import Usuario
from app.auth.dependencies import obtener_usuario_actual


router = APIRouter(
    prefix="/api/Usuarios",
    tags=["Usuarios"]
)


@router.get("/me", response_model=UsuarioRespuesta)
def obtener_perfil_actual(
    usuario = Depends(obtener_usuario_actual)
):
    return usuario


@router.get("/", response_model=list[UsuarioRespuesta])
def listar_usuarios(db: Session = Depends(get_db)):
    return obtener_usuarios(db)