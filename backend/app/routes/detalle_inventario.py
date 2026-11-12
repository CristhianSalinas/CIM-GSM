from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db

from app.schemas.detalle_inventario import (
    DetalleInventarioCrear,
    DetalleInventarioRespuesta
)

from app.controllers.detalle_inventario import (
    registrar_detalle_inventario,
    obtener_detalles_inventario,
    obtener_detalles_por_inventario,
    obtener_detalle_por_id
)


router = APIRouter(
    prefix="/api/detalle-inventario",
    tags=["Detalle Inventario"]
)


# REGISTRAR DETALLE
@router.post(
    "/",
    response_model=DetalleInventarioRespuesta
)
def crear_detalle(
    datos: DetalleInventarioCrear,
    db: Session = Depends(get_db)
):

    try:
        return registrar_detalle_inventario(db, datos)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        print("ERROR AL REGISTRAR DETALLE:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al registrar el detalle del inventario."
        )


# CONSULTAR TODOS
@router.get(
    "/",
    response_model=list[DetalleInventarioRespuesta]
)
def listar_detalles(
    db: Session = Depends(get_db)
):

    return obtener_detalles_inventario(db)


# CONSULTAR POR INVENTARIO
@router.get(
    "/inventario/{id_inventario}",
    response_model=list[DetalleInventarioRespuesta]
)
def listar_por_inventario(
    id_inventario: int,
    db: Session = Depends(get_db)
):

    return obtener_detalles_por_inventario(
        db,
        id_inventario
    )


# CONSULTAR POR ID
@router.get(
    "/{id_detalle_inventario}",
    response_model=DetalleInventarioRespuesta
)
def consultar_detalle(
    id_detalle_inventario: int,
    db: Session = Depends(get_db)
):

    detalle = obtener_detalle_por_id(
        db,
        id_detalle_inventario
    )

    if not detalle:
        raise HTTPException(
            status_code=404,
            detail="Detalle de inventario no encontrado."
        )

    return detalle