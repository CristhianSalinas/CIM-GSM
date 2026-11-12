from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from app.auth.dependencies import obtener_usuario_actual
from app.config.database import get_db
from app.controllers.productos import obtener_productos, obtener_estadisticas_productos
from app.schemas.producto import ProductoRespuesta
from app.models.usuario import Usuario


router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)


@router.get("", response_model=list[ProductoRespuesta])
@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(
    usuario: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)):
    return obtener_productos(db)

@router.get("/estadisticas")
def listar_estadisticas_productos(db: Session = Depends(get_db)):
    return obtener_estadisticas_productos(db)