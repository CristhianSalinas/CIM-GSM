from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.inventarios import Inventarios
from app.models.producto import Producto
from app.models.detalle_inventario import DetalleInventario
from app.models.historial_movimientos import Movimientos

from app.schemas.inventarios import InventariosCrear


def obtener_inventarios(db: Session):

    consulta = text("""
        SELECT
            i.id_inventario,
            i.id_usuario,
            i.id_ubicacion,
            i.id_categoria,
            i.fecha,
            i.observacion,
            i.id_estado,
            c.nombre AS categoria
        FROM inventarios i
        LEFT JOIN categorias c
            ON c.id_categoria = i.id_categoria
        ORDER BY i.id_inventario DESC
    """)

    resultado = db.execute(consulta).mappings().all()

    return [dict(fila) for fila in resultado]



def obtener_inventarios_conteo(db: Session):

    consulta = text("""
        SELECT
            SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END)
                AS inventarios_pendientes,

            SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END)
                AS inventarios_en_progreso

        FROM inventarios
    """)

    resultado = db.execute(consulta).mappings().first()

    return dict(resultado)



def registrar_inventario(db: Session, datos: InventariosCrear):

    try:
        if not datos.productos:
            raise ValueError("Debes agregar al menos un producto.")

        ids_productos = [
            item.id_producto for item in datos.productos
        ]

        if len(ids_productos) != len(set(ids_productos)):
            raise ValueError("Hay productos repetidos en el inventario.")

        nuevo_inventario = Inventarios(
            id_usuario=datos.id_usuario,
            id_ubicacion=None,
            id_categoria=datos.id_categoria,
            id_estado=3,
            observacion=datos.observacion or ""
        )

        db.add(nuevo_inventario)
        db.flush()

        for item in datos.productos:

            producto = db.query(Producto).filter(
                Producto.id_producto == item.id_producto
            ).first()

            if not producto:
                raise ValueError(
                    f"El producto {item.id_producto} no existe."
                )

            detalle = DetalleInventario(
                id_inventario=nuevo_inventario.id_inventario,
                id_producto=producto.id_producto,
                cantidad_anterior=producto.cantidad_fisica or 0,
                cantidad_contada=0,
                diferencia=0,
                id_estado=2
            )

            db.add(detalle)

        db.commit()
        db.refresh(nuevo_inventario)

        return nuevo_inventario

    except Exception:
        db.rollback()
        raise


def finalizar_inventario(db: Session, id_inventario: int):

    try:
        inventario = db.query(Inventarios).filter(
            Inventarios.id_inventario == id_inventario
        ).with_for_update().first()

        if not inventario:
            return None

        if inventario.id_estado == 1:
            raise ValueError("El inventario ya está completado.")

        if inventario.id_estado != 3:
            raise ValueError("El inventario no está en progreso.")

        if not inventario.id_usuario:
            raise ValueError(
                "El inventario no tiene un usuario asignado."
            )

        detalles = db.query(DetalleInventario).filter(
            DetalleInventario.id_inventario == id_inventario
        ).with_for_update().all()

        if not detalles:
            raise ValueError("El inventario no tiene productos.")

        pendientes = [
            detalle for detalle in detalles
            if detalle.id_estado != 1
        ]

        if pendientes:
            raise ValueError(
                f"Faltan {len(pendientes)} productos por contar."
            )

        for detalle in detalles:

            producto = db.query(Producto).filter(
                Producto.id_producto == detalle.id_producto
            ).with_for_update().first()

            if not producto:
                raise ValueError(
                    f"No existe el producto {detalle.id_producto}."
                )

            # La existencia oficial solo cambia al finalizar.
            producto.cantidad_fisica = detalle.cantidad_contada

            

            movimiento = Movimientos(
                id_usuario=inventario.id_usuario,
                id_producto=detalle.id_producto,
                id_inventario=id_inventario,
                id_movimentos=3,
                id_pedido=None,
                id_estado=1,
                cantidad=detalle.cantidad_contada,
                observacion=(
                    f"Ajuste por inventario #{id_inventario}. "
                    f"Diferencia: {detalle.diferencia}"
                )
            )

            db.add(movimiento)

        inventario.id_estado = 1

        db.commit()
        db.refresh(inventario)

        return inventario

    except Exception:
        db.rollback()
        raise