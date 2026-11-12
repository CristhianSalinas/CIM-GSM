from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.auth import LoginRequest, TokenRespuesta
from app.controllers.auth import autenticar_usuario
from app.auth.security import verificar_password, crear_access_token


router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


@router.post("/login", response_model=TokenRespuesta)
def iniciar_sesion(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = autenticar_usuario(db, datos.usuario)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo"
        )

    if not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    token = crear_access_token({
        "sub": str(usuario.id_usuario),
        "rol": usuario.id_rol
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "usuario": usuario.usuario,
        "id_rol": usuario.id_rol
    }