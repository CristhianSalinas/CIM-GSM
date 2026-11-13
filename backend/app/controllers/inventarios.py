
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.inventarios import Inventarios
from app.models.producto import Producto
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
            c.nombre AS categoria

        FROM inventarios i

        LEFT JOIN categorias c
            ON c.id_categoria = i.id_categoria

        ORDER BY i.id_inventario DESC
    """)

    resultado = db.execute(consulta).mappings().all()

    return [dict(fila) for fila in resultado]

def finalizar_inventario(db: Session, id_inventario: int, datos):

    try:
        # 1. Buscar y bloquear el inventario
        inventario = db.query(Inventarios).filter(
            Inventarios.id_inventario == id_inventario
        ).with_for_update().first()

        if not inventario:
            return None

        # 2. Verificar que no esté finalizado
        if inventario.id_estado == 1:
            raise ValueError("Este inventario ya está completado")

        # 3. Validar usuario responsable
        if not inventario.id_usuario:
            raise ValueError(
                "El inventario no tiene un usuario asignado"
            )

        # 4. Evitar productos repetidos
        ids_productos = [
            producto.id_producto for producto in datos.productos
        ]

        if len(ids_productos) != len(set(ids_productos)):
            raise ValueError(
                "Hay productos repetidos en el inventario"
            )

        # 5. Procesar cada producto
        for item in datos.productos:

            producto = db.query(Producto).filter(
                Producto.id_producto == item.id_producto
            ).with_for_update().first()

            if not producto:
                raise ValueError(
                    f"No existe el producto {item.id_producto}"
                )

            # Existencia real antes del conteo
            cantidad_anterior = producto.cantidad_fisica or 0

            # Diferencia calculada por el backend
            diferencia = item.cantidad_actual - cantidad_anterior

            # 6. Registrar detalle del inventario
            db.execute(
                text("""
                    INSERT INTO detalle_inventario (
                        id_inventario,
                        id_usuario,
                        id_producto,
                        cantidad_anterior,
                        cantidad_actual,
                        diferencia,
                        observacion,
                        fecha_finalizar
                    )
                    VALUES (
                        :id_inventario,
                        :id_usuario,
                        :id_producto,
                        :cantidad_anterior,
                        :cantidad_actual,
                        :diferencia,
                        :observacion,
                        NOW()
                    )
                """),
                {
                    "id_inventario": id_inventario,
                    "id_usuario": inventario.id_usuario,
                    "id_producto": item.id_producto,
                    "cantidad_anterior": cantidad_anterior,
                    "cantidad_actual": item.cantidad_actual,
                    "diferencia": diferencia,
                    "observacion": item.observacion
                }
            )

            # 7. Actualizar existencia del producto
            producto.cantidad_fisica = item.cantidad_actual

        # 8. Marcar inventario como completado
        inventario.id_estado = 1

        # 9. Guardar todos los cambios
        db.commit()

        return inventario

    except Exception:
        db.rollback()
        raise
    
def registrar_inventario(db: Session, datos: InventariosCrear):

    try:
        # Buscar producto y bloquear registro durante la operación
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto
        ).with_for_update().first()

        if not producto:
            return None

        # Obtener cantidad física anterior
        cantidad_anterior = producto.cantidad_fisica or 0

        # Calcular diferencia
        diferencia = datos.cantidad_contada - cantidad_anterior

        # Crear registro del inventario
        nuevo_inventario = Inventarios(
            id_usuario=datos.id_usuario,
            id_ubicacion=datos.id_ubicacion,
            id_categoria=datos.id_categoria,
            id_estado=datos.id_estado,
            cantidad_anterior=cantidad_anterior,
            cantidad_contada=datos.cantidad_contada,
            diferencia=diferencia,
            observacion=datos.observacion or ""
        )

        # Actualizar existencias del producto
        producto.cantidad_fisica = datos.cantidad_contada

        db.add(nuevo_inventario)
        db.commit()
        db.refresh(nuevo_inventario)

        return nuevo_inventario

    except Exception:
        db.rollback()
        raise

    
