
from sqlalchemy.orm import Session

from app.models.detalle_inventario import DetalleInventario
from app.models.inventarios import Inventarios
from app.schemas.detalle_inventario import DetalleInventarioCrear


# REGISTRAR O ACTUALIZAR CONTEO DE INVENTARIO
def registrar_detalle_inventario(
    db: Session,
    datos: DetalleInventarioCrear
):
    try:
        # 1. Validar que exista el inventario y bloquear su registro
        inventario = db.query(Inventarios).filter(
            Inventarios.id_inventario == datos.id_inventario
        ).with_for_update().first()

        if not inventario:
            raise ValueError("El inventario no existe.")


        # 3. Validar la cantidad ingresada
        if datos.cantidad_contada is None:
            raise ValueError("Debes ingresar la cantidad contada.")

        if datos.cantidad_contada < 0:
            raise ValueError("La cantidad no puede ser negativa.")

        # 4. Buscar el detalle previamente creado
        detalle = db.query(DetalleInventario).filter(
            DetalleInventario.id_inventario == datos.id_inventario,
            DetalleInventario.id_producto == datos.id_producto
        ).with_for_update().first()

        if not detalle:
            raise ValueError(
                "El producto no pertenece a este inventario."
            )

        # 5. Actualizar el conteo existente
        detalle.cantidad_contada = datos.cantidad_contada

        # Diferencia entre cantidad contada y cantidad anterior
        detalle.diferencia = (
            datos.cantidad_contada - detalle.cantidad_anterior
        )

        # Estado 1 = Completado / Contado
        detalle.id_estado = 1

        detalle.observacion = datos.observacion

        # Primer conteo: pasar inventario de pendiente a en progreso.
        if inventario.id_estado == 2:
            inventario.id_estado = 3

        db.commit()
        db.refresh(detalle)

        return detalle

    except Exception:
        db.rollback()
        raise


# CONSULTAR TODOS LOS DETALLES
def obtener_detalles_inventario(db: Session):

    return db.query(DetalleInventario).all()


# CONSULTAR DETALLES POR INVENTARIO
def obtener_detalles_por_inventario(
    db: Session,
    id_inventario: int
):

    return db.query(DetalleInventario).filter(
        DetalleInventario.id_inventario == id_inventario
    ).all()


# CONSULTAR UN DETALLE POR ID
def obtener_detalle_por_id(
    db: Session,
    id_detalle_inventario: int
):

    return db.query(DetalleInventario).filter(
        DetalleInventario.id_detalles_inventario
        == id_detalle_inventario
    ).first()
