from sqlalchemy.orm import Session
from app.models.pedido import Pedido
from app.models.cliente import Cliente
from app.models.detalle_pedido import DetallePedido
from app.models.producto import Producto
from sqlalchemy import func
from app.schemas.pedido import PedidoConProductosCrear


def obtener_pedidos(db: Session):
    return db.query(Pedido).all()

def buscar_productos(db: Session, busqueda: str):
    return db.query(Producto).filter(
        (Producto.codigo_sm.ilike(f"%{busqueda}%")) |
        (Producto.nombre.ilike(f"%{busqueda}%"))
    ).limit(20).all()

def crear_pedido(
    db: Session,
    datos: PedidoConProductosCrear,
    tipo_movimiento: int = 1
):
    try:
        # Validar cliente
        cliente = db.query(Cliente).filter(
            Cliente.id_cliente == datos.id_cliente
        ).first()

        if not cliente:
            raise ValueError("El cliente no existe.")

        # Validar que existan productos
        if not datos.productos:
            raise ValueError("Debes agregar al menos un producto.")

        # Validar productos y cantidades
        for item in datos.productos:

            if item.cantidad <= 0:
                raise ValueError("La cantidad debe ser mayor que cero.")

            producto = db.query(Producto).filter(
                Producto.id_producto == item.id_producto
            ).first()

            if not producto:
                raise ValueError(
                    f"El producto {item.id_producto} no existe."
                )

        # Generar número de pedido
        ultimo_numero = db.query(
            func.max(Pedido.numero_pedido)
        ).scalar()

        numero_generado = (ultimo_numero or 0) + 1

        # Crear pedido
        pedido = Pedido(
            numero_pedido=numero_generado,
            id_cliente=datos.id_cliente,
            id_estado=2,
            id_entrada=tipo_movimiento
        )

        db.add(pedido)
        db.flush()

        # Agregar productos al pedido
        for item in datos.productos:

            detalle = DetallePedido(
                id_pedido=pedido.id_pedido,
                id_producto=item.id_producto,
                cantidad_solicitada=item.cantidad,
                cantidad_despachada=0
            )

            db.add(detalle)

        db.commit()
        db.refresh(pedido)

        return pedido

    except Exception:
        db.rollback()
        raise

def obtener_productos_pedidos(db: Session, id_pedido: int):

    productos = (
        db.query(
            DetallePedido.id_detalle,
            Producto.id_producto,
            Producto.nombre,
            Producto.codigo_sm,
            Producto.id_marca,
            Producto.referencia,
            Producto.descripcion,
            Producto.precio,
            Producto.cantidad_fisica,
            DetallePedido.cantidad_solicitada,
            DetallePedido.cantidad_despachada
        )
        .join(
            Producto,
            Producto.id_producto == DetallePedido.id_producto
        )
        .filter(
            DetallePedido.id_pedido == id_pedido
        )
        .all()
    )

    return [
        {
            "id_detalle": producto.id_detalle,
            "id_producto": producto.id_producto,
            "nombre": producto.nombre,
            "codigo_sm": producto.codigo_sm,
            "id_marca": producto.id_marca,
            "referencia": producto.referencia,
            "descripcion": producto.descripcion,
            "precio": producto.precio,
            "cantidad_fisica": producto.cantidad_fisica,
            "cantidad_solicitada": producto.cantidad_solicitada,
            "cantidad_despachada": producto.cantidad_despachada
        }
        for producto in productos
    ]

def obtener_pedidos_por_tipo(db: Session, tipo: int):
        pedidos = (
        db.query(
            Pedido.id_pedido,
            Pedido.numero_pedido,
            Cliente.nombre.label("cliente"),
            Pedido.id_entrada,
            Pedido.id_estado
        )
        .join(
            Cliente,
            Pedido.id_cliente == Cliente.id_cliente
        )
        .filter(Pedido.id_entrada == tipo)
        .all()
    )

        return [
                {
                    "id_pedido": pedido.id_pedido,
                    "numero_pedido": pedido.numero_pedido,
                    "cliente": pedido.cliente,
                    "id_entrada": pedido.id_entrada,
                    "id_estado": pedido.id_estado
                }
                for pedido in pedidos
            ]


def finalizar_pedido(db: Session, id_pedido: int):

    try:
        pedido = db.query(Pedido).filter(
            Pedido.id_pedido == id_pedido
        ).with_for_update().first()

        if not pedido:
            raise ValueError("Pedido no encontrado.")

        if pedido.id_estado in [1, 5]:
            raise ValueError("El pedido ya está cerrado.")

        pedido.id_estado = 1

        db.commit()
        db.refresh(pedido)

        return pedido

    except Exception:
        db.rollback()
        raise

def obtener_estado_pedido(db: Session, id_pedido: int):
    pedido = db.query(Pedido).filter(
        Pedido.id_pedido == id_pedido
    ).first()

    if not pedido:
        return None

    return {
        "id_pedido": pedido.id_pedido,
        "id_estado": pedido.id_estado
    }


