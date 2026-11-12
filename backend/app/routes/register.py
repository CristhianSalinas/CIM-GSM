from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.usuario import UsuarioCrear
from app.controllers.register import registrar_usuario


router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)


@router.post("/crear")
def crear_usuario(
    datos: UsuarioCrear,
    db: Session = Depends(get_db)
):
    try:
        return registrar_usuario(db, datos)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        print("ERROR AL REGISTRAR USUARIO:", repr(e))