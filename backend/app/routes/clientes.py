from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.clientes import obtener_cliente, crear_cliente
from app.schemas.cliente import ClienteCrear, ClienteRespuesta




router = APIRouter(
    prefix="/api/clientes",
    tags=["Clientes"]
)

# Consultar todos los clientes
@router.get("/", response_model=list[ClienteRespuesta])
def listar_clientes(db: Session = Depends(get_db)):
    return obtener_cliente(db)

#registrar un nuevo cliente
@router.post("/", response_model=ClienteRespuesta)
def registrar_cliente(datos: ClienteCrear, db: Session = Depends(get_db)):
    return crear_cliente(db, datos)