from sqlalchemy.orm import Session

from app.models.detalle_inventario import DetalleInventario
from app.models.inventarios import Inventarios
from app.models.producto import Producto
from app.models.usuario import Usuario

from app.schemas.detalle_inventario import DetalleInventarioCrear


# REGISTRAR DETALLE DE INVENTARIO
def registrar_detalle_inventario(
    db: Session,
    datos: DetalleInventarioCrear
):

    try:
        # Validar que exista el inventario
        inventario = db.query(Inventarios).filter(
            Inventarios.id_inventario == datos.id_inventario
        ).first()

        if not inventario:
            raise ValueError("El inventario no existe.")

        # Validar que exista el usuario
        usuario = db.query(Usuario).filter(
            Usuario.id_usuario == datos.id_usuario
        ).first()

        if not usuario:
            raise ValueError("El usuario no existe.")

        # Validar que exista el producto
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto
        ).first()

        if not producto:
            raise ValueError("El producto no existe.")

        # Calcular diferencia
        diferencia = (
            datos.cantidad_actual - datos.cantidad_anterior
        )

        # Crear registro
        nuevo_detalle = DetalleInventario(
            id_inventario=datos.id_inventario,
            id_usuario=datos.id_usuario,
            id_producto=datos.id_producto,
            cantidad_anterior=datos.cantidad_anterior,
            cantidad_actual=datos.cantidad_actual,
            diferencia=diferencia,
            observacion=datos.observacion
        )

        db.add(nuevo_detalle)
        db.commit()
        db.refresh(nuevo_detalle)

        return nuevo_detalle

    except ValueError:
        raise

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
        DetalleInventario.id_detalle_inventario
        == id_detalle_inventario
    ).first()