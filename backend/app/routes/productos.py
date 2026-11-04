from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.productos import obtener_productos
from app.schemas.producto import ProductoRespuesta


router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)


@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(db: Session = Depends(get_db)):
    return obtener_productos(db)