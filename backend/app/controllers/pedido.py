from sqlalchemy.orm import Session
from app.models.pedido import Pedido
from app.models.cliente import Cliente
from app.models.detalle_pedido import DetallePedido
from app.models.producto import Producto


def obtener_pedidos(db: Session):
    return db.query(Pedido).all()

def obtener_productos_pedidos(db: Session, id_pedido: int):
    productos = (
            db.query(
                DetallePedido.id_detalle,
                Producto.id_producto,
                Producto.nombre,
                Producto.codigo_sm,
                DetallePedido.cantidad_solicitada
            )
                    .join(
                        DetallePedido,
                        Producto.id_producto == DetallePedido.id_producto
                    )
                    .filter(DetallePedido.id_pedido == id_pedido)
                    .all()
                )
    return [
         {  
                "id_detalle": producto.id_detalle,
                "id_producto":producto.id_producto,
                "nombre":producto.nombre,
                "codigo_sm":producto.codigo_sm,
                "cantidad_solicitada": producto.cantidad_solicitada
         }
          for producto in productos
    ]

def obtener_pedidos_por_tipo(db: Session, tipo: int):
        pedidos = (
        db.query(
            Pedido.id_pedido,
            Pedido.numero_pedido,
            Cliente.nombre.label("cliente"),
            Pedido.id_entrada
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
                "id_entrada": pedido.id_entrada
            }
            for pedido in pedidos
        ]