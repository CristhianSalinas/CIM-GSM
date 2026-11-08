from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.pedido import PedidoRespuesta
from app.controllers.pedido import (
    obtener_pedidos, 
    obtener_pedidos_por_tipo, 
    obtener_productos_pedidos,
    finalizar_pedido,
    obtener_estado_pedido)





router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)


@router.get("/", response_model=list[PedidoRespuesta])
def listar_pedidos(db: Session = Depends(get_db)):
    return obtener_pedidos(db)




@router.get("/{id_pedido}/productos")
def listar_pedidos_por_tipo(
    id_pedido: int,
    db: Session = Depends(get_db)
):
    return obtener_productos_pedidos(db, id_pedido)





@router.post("/{id_pedido}/finalizar")
def finalizar_recepcion(
    id_pedido: int,
    db: Session = Depends(get_db)
):
    return finalizar_pedido(db, id_pedido)




@router.get("/por-tipo")
def listar_pedidos_por_tipo(
    tipo: int,
    db: Session = Depends(get_db)
):
    return obtener_pedidos_por_tipo(db, tipo)




@router.get("/{id_pedido}/estado")
def consultar_estado_pedido(
    id_pedido: int,
    db: Session = Depends(get_db)
):
    resultado = obtener_estado_pedido(db, id_pedido)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado."
        )

    return resultado