from sqlalchemy.orm import Session
from app.models.historial_movimientos import Movimientos
from app.schemas.historial_movimientos import MovimientosCrear, MovimientoInventarioCrear

from app.models.detalle_inventario import DetalleInventario

from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.detalle_pedido import DetallePedido

from app.models.pedido import Pedido




def obtener_movimientos(db: Session):
    return db.query(Movimientos).all()


def obtener_historial(db: Session):

    movimientos = (
        db.query(
            Movimientos.id,
            Movimientos.id_movimentos,
            Movimientos.id_usuario,
            Movimientos.id_producto,
            Movimientos.fecha,
            Movimientos.observacion,
            Movimientos.id_pedido,
            Movimientos.id_estado,
            Movimientos.cantidad,
            Movimientos.id_inventario,
            Producto.nombre.label("producto"),
            Producto.codigo_sm,
            Usuario.nombre.label("usuario")
        )
        .join(
            Producto,
            Producto.id_producto == Movimientos.id_producto
        )
        .join(
            Usuario,
            Usuario.id_usuario == Movimientos.id_usuario
        )
        .order_by(Movimientos.fecha.desc())
        .all()
    )

    return [
        {
            "id": m.id,
            "id_movimentos": m.id_movimentos,
            "id_usuario": m.id_usuario,
            "id_producto": m.id_producto,
            "fecha": m.fecha,
            "observacion": m.observacion,
            "id_pedido": m.id_pedido,
            "id_estado": m.id_estado,
            "cantidad": m.cantidad,
            "id_inventario": m.id_inventario,
            "producto": m.producto,
            "codigo_sm": m.codigo_sm,
            "usuario": m.usuario
        }
        for m in movimientos
    ]




def salida_movimientos(db: Session, datos: MovimientosCrear):

    try:
        # 1. Validar cantidad
        if datos.cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que cero.")

        # 2. Buscar pedido y bloquearlo
        pedido = db.query(Pedido).filter(
            Pedido.id_pedido == datos.id_pedido
        ).with_for_update().first()

        if not pedido:
            raise ValueError("Pedido no encontrado.")

        if pedido.id_estado in [1, 5]:
            raise ValueError("Este pedido ya está cerrado.")

        # 3. Buscar exclusivamente el detalle solicitado
        detalle = db.query(DetallePedido).filter(
            DetallePedido.id_detalle == datos.id_detalle,
            DetallePedido.id_pedido == datos.id_pedido,
            DetallePedido.id_producto == datos.id_producto
        ).with_for_update().first()

        if not detalle:
            raise ValueError("El producto no pertenece a esta línea del pedido.")

        # 4. Calcular pendiente de esa línea
        despachado = detalle.cantidad_despachada or 0
        solicitado = detalle.cantidad_solicitada
        pendiente = solicitado - despachado

        if datos.cantidad > pendiente:
            raise ValueError(
                f"Solo quedan {pendiente} unidades pendientes en esta línea."
            )

        # 5. Buscar producto y bloquearlo
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto
        ).with_for_update().first()

        if not producto:
            raise ValueError("Producto no encontrado.")

        # 6. Validar existencias físicas
        existencias = producto.cantidad_fisica or 0

        if datos.cantidad > existencias:
            raise ValueError(
                f"Existencias insuficientes. Disponibles: {existencias}."
            )

        # 7. Actualizar exclusivamente el detalle seleccionado
        detalle.cantidad_despachada = despachado + datos.cantidad

        # 8. Descontar inventario físico
        producto.cantidad_fisica = existencias - datos.cantidad

        # 9. Cambiar estado del pedido
        if pedido.id_estado == 2:
            pedido.id_estado = 3

        # 10. Comprobar si todas las líneas fueron despachadas
        detalles_pedido = db.query(DetallePedido).filter(
            DetallePedido.id_pedido == datos.id_pedido
        ).all()

        pedido_completo = all(
            (item.cantidad_despachada or 0) >= item.cantidad_solicitada
            for item in detalles_pedido
        )

        if pedido_completo:
            pedido.id_estado = 1

        # 11. Registrar movimiento
        nuevo_movimiento = Movimientos(
            id_usuario=datos.id_usuario,
            id_movimentos=datos.id_movimentos,
            id_pedido=datos.id_pedido,
            id_producto=datos.id_producto,
            id_estado=datos.id_estado,
            cantidad=datos.cantidad,
            
            observacion=datos.observacion or ""
        )

        db.add(nuevo_movimiento)

        # 12. Guardar todos los cambios
        db.commit()
        db.refresh(nuevo_movimiento)

        return nuevo_movimiento

    except Exception:
        db.rollback()
        raise




def registrar_movimientos(db: Session, datos: MovimientosCrear):

    try:
        # Validar cantidad
        if datos.cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor que cero.")

        # Buscar pedido
        pedido = db.query(Pedido).filter(
            Pedido.id_pedido == datos.id_pedido
        ).with_for_update().first()

        if not pedido:
            raise ValueError("Pedido no encontrado.")

        # Verificar que no esté finalizado ni cancelado
        if pedido.id_estado in [1, 5]:
            raise ValueError("Este pedido ya está cerrado.")

        # Buscar el detalle exacto del pedido
        detalle_pedido = db.query(DetallePedido).filter(
            DetallePedido.id_detalle == datos.id_detalle,
            DetallePedido.id_pedido == datos.id_pedido,
            DetallePedido.id_producto == datos.id_producto
        ).with_for_update().first()

        if not detalle_pedido:
            raise ValueError("El producto no pertenece a este pedido.")

        # Calcular cantidad pendiente
        cantidad_recibida = detalle_pedido.cantidad_despachada or 0

        pendiente = (
            detalle_pedido.cantidad_solicitada - cantidad_recibida
        )

        # Validar cantidad pendiente
        if pendiente <= 0:
            raise ValueError("Este producto ya fue recibido completamente.")

        if datos.cantidad > pendiente:
            raise ValueError(
                f"Solo puedes recibir {pendiente} unidades pendientes."
            )

        # Buscar producto
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto
        ).with_for_update().first()

        if not producto:
            raise ValueError("Producto no encontrado.")

        # Cambiar estado a En progreso
        if pedido.id_estado == 2:
            pedido.id_estado = 3

        # Actualizar cantidad recibida del detalle
        detalle_pedido.cantidad_despachada = (
            cantidad_recibida + datos.cantidad
        )

        # Actualizar existencias físicas
        producto.cantidad_fisica = (
            (producto.cantidad_fisica or 0) + datos.cantidad
        )

        # Consultar todos los detalles del pedido
        detalles_pedido = db.query(DetallePedido).filter(
            DetallePedido.id_pedido == datos.id_pedido
        ).all()

        # Verificar si todos fueron recibidos
        pedido_completo = all(
            (detalle.cantidad_despachada or 0) >= detalle.cantidad_solicitada
            for detalle in detalles_pedido
        )

        # Finalizar pedido cuando todo esté recibido
        if pedido_completo:
            pedido.id_estado = 1

        # Registrar movimiento
        nuevo_inventario = Movimientos(
            id_usuario=datos.id_usuario,
            id_movimentos=datos.id_movimentos,
            id_pedido=datos.id_pedido,
            id_producto=datos.id_producto,
            id_estado=datos.id_estado,
            cantidad=datos.cantidad,
            observacion=datos.observacion or "",
            id_inventario=datos.id_inventario,
        )

        db.add(nuevo_inventario)

        db.commit()
        db.refresh(nuevo_inventario)

        return nuevo_inventario

    except Exception:
        db.rollback()
        raise





def registrar_conteo_inventario(
    db: Session,
    datos: MovimientoInventarioCrear
):
    try:
        # Buscar el detalle del producto dentro del inventario
        detalle = db.query(DetalleInventario).filter(
            DetalleInventario.id_inventario == datos.id_inventario,
            DetalleInventario.id_producto == datos.id_producto
        ).with_for_update().first()

        if not detalle:
            raise ValueError(
                "No existe este producto dentro del inventario."
            )

        # Evitar registrar nuevamente un producto ya contado
        # si el inventario ya está finalizado
        if detalle.id_estado == 1:
            raise ValueError("Este producto ya fue contado.")

        # Actualizar el detalle existente
        diferencia = datos.cantidad - detalle.cantidad_anterior

        detalle.cantidad_contada = datos.cantidad
        detalle.diferencia = diferencia
        detalle.id_estado = 1
        detalle.observacion = datos.observacion

        # Registrar historial
        movimiento = Movimientos(
            id_usuario=datos.id_usuario,
            id_movimentos=3,
            id_pedido=None,
            id_producto=datos.id_producto,
            id_estado=1,
            id_inventario=datos.id_inventario,
            cantidad=datos.cantidad,
            observacion=datos.observacion or "Conteo de inventario"
        )

        db.add(movimiento)
        db.commit()
        db.refresh(movimiento)

        return {
            "mensaje": "Conteo registrado correctamente.",
            "cantidad": datos.cantidad,
            "diferencia": diferencia,
            "id_producto": datos.id_producto
        }

    except Exception:
        db.rollback()
        raise