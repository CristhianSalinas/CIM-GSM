from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from app.config.database import get_db
from app.models.usuario import Usuario
from app.auth.security import verificar_token


bearer_scheme = HTTPBearer()


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = credenciales.credentials

    try:
        datos = verificar_token(token)
        id_usuario = datos.get("sub")

        if id_usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == int(id_usuario)
    ).first()

    if not usuario or not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inexistente o inactivo"
        )

    return usuario