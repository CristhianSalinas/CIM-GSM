from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.pedido import obtener_pedidos
from app.schemas.pedido import PedidoRespuesta


router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)


@router.get("/", response_model=list[PedidoRespuesta])
def listar_pedidos(db: Session = Depends(get_db)):
    return obtener_pedidos(db)