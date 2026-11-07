from sqlalchemy.orm import Session
from app.models.inventarios import Inventarios
from app.models.producto import Producto
from app.schemas.inventarios import InventariosCrear


def obtener_inventarios(db: Session):
    return db.query(Inventarios).all()

def registrar_inventario(db: Session, datos: InventariosCrear):

    try:
        # Buscar producto
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto
        ).with_for_update().first()

        if not producto:
            return None

        # Obtener cantidad actual
        cantidad_anterior = producto.cantidad_fisica or 0

        # Calcular diferencia
        diferencia = datos.cantidad_contada - cantidad_anterior

        # Crear registro del inventario
        nuevo_inventario = Inventarios(
            id_usuario=datos.id_usuario,
            id_ubicacion=datos.id_ubicacion,
            id_producto=datos.id_producto,
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