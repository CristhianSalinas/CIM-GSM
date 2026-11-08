from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.pedido import PedidoRespuesta, PedidoConProductosCrear
from app.controllers.pedido import (
    obtener_pedidos, 
    obtener_pedidos_por_tipo, 
    obtener_productos_pedidos,
    finalizar_pedido,
    obtener_estado_pedido,
    crear_pedido, 
    buscar_productos)





router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)

@router.get("/buscar")
def buscar_productos_ruta(
    busqueda: str,
    db: Session = Depends(get_db)
):
    return buscar_productos(db, busqueda)


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


@router.post("/crear", response_model=PedidoRespuesta)
def registrar_pedido(
    datos: PedidoConProductosCrear,
    db: Session = Depends(get_db)
):
    try:
        return crear_pedido(db, datos)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        print("ERROR AL CREAR PEDIDO:", e)
        raise HTTPException(
            status_code=500,
            detail="Error interno al crear el pedido."
        )

    
@router.post("/crear-salida", response_model=PedidoRespuesta)
def registrar_salida(
    datos: PedidoConProductosCrear,
    db: Session = Depends(get_db)
):
    try:
        return crear_pedido(
            db,
            datos,
            tipo_movimiento=2
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        print("ERROR AL CREAR SALIDA:", e)
        raise HTTPException(
            status_code=500,
            detail="Error interno al crear la salida."
        )
