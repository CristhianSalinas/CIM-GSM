
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db

from app.controllers.inventarios import (
    obtener_inventarios,
    registrar_inventario,
    finalizar_inventario
)

from app.schemas.inventarios import (
    InventariosRespuesta,
    InventariosCrear,
    InventarioListado,
    InventarioFinalizar
)

router = APIRouter(
    prefix="/api/inventarios",
    tags=["Inventarios"]
)


# Listar inventarios con categoría y estado
@router.get("/", response_model=list[InventarioListado])
def listar_inventarios(
    db: Session = Depends(get_db)
):
    return obtener_inventarios(db)

# Finalizar inventario y guardar sus productos
@router.post("/{id_inventario}/finalizar")
def finalizar(
    id_inventario: int,
    datos: InventarioFinalizar,
    db: Session = Depends(get_db)
):
    try:
        inventario = finalizar_inventario(
            db,
            id_inventario,
            datos
        )

        if inventario is None:
            raise HTTPException(
                status_code=404,
                detail="Inventario no encontrado"
            )

        return {
            "mensaje": "Inventario finalizado correctamente",
            "id_inventario": inventario.id_inventario,
            "id_estado": inventario.id_estado
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
# Registrar inventario
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
