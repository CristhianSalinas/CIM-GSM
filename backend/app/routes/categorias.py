from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.categorias import obtener_categoria, crear_categoria
from app.schemas.categorias import CategoriasCrear, CategoriasRespuesta




router = APIRouter(
    prefix="/api/Categorias",
    tags=["Categorias"]
)

# Consultar todos los clientes
@router.get("/", response_model=list[CategoriasRespuesta])
def listar_categorias(db: Session = Depends(get_db)):
    return obtener_categoria(db)

#registrar un nuevo cliente
@router.post("/", response_model=CategoriasRespuesta)
def registrar_categoria(datos: CategoriasCrear, db: Session = Depends(get_db)):
    return crear_categoria(db, datos)