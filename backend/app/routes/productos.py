from fastapi import APIRouter, Depends, Query

from sqlalchemy.orm import Session

from app.auth.dependencies import obtener_usuario_actual
from app.config.database import get_db
from app.controllers.productos import (
    obtener_productos,
    obtener_estadisticas_productos,
    obtener_productos_por_categoria,
    obtener_productos_all
)
from app.schemas.producto import ProductoRespuesta
from app.models.usuario import Usuario


router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)


@router.get("", response_model=list[ProductoRespuesta])
@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(
    busqueda: str = Query(default="", min_length=0),
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    if busqueda.strip():
        return obtener_productos(db, busqueda)

    return obtener_productos(db, "")




# Consultar todos los clientes
@router.get("/all", response_model=list[ProductoRespuesta])
def listar_productos_all(db: Session = Depends(get_db)):
    return obtener_productos_all(db)


@router.get("/categoria", response_model=list[ProductoRespuesta])
def listar_productos(
    id_Categoria: int = Query(...),
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return obtener_productos_por_categoria(db, id_Categoria)


@router.get("/estadisticas")
def listar_estadisticas_productos(
    db: Session = Depends(get_db)
):
    return obtener_estadisticas_productos(db)   