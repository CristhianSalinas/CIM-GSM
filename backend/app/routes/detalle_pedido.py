from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.detalle_pedido import obtener_detalle
from app.schemas.detalle_pedido import DetallePedidoRespuesta


router = APIRouter(
    prefix="/api/detalle_pedidos",
    tags=["Detalle Pedidos"]
)


@router.get("/", response_model=list[DetallePedidoRespuesta])
def listar_detalle_pedidos(db: Session = Depends(get_db)):
    return obtener_detalle(db)