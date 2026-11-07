from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.inventarios import (
    obtener_inventarios,
    registrar_inventario
)
from app.schemas.inventarios import (
    InventariosRespuesta,
    InventariosCrear
)

router = APIRouter(
    prefix="/api/inventarios",
    tags=["Inventarios"]
)

@router.get("/", response_model=list[InventariosRespuesta])
def listar_inventarios(db: Session = Depends(get_db)):
    return obtener_inventarios(db)


@router.post("/enviar", response_model=InventariosRespuesta)
def crear_inventario(
    datos: InventariosCrear,
    db: Session = Depends(get_db)
):
    inventario = registrar_inventario(db, datos)

    if inventario is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return inventario