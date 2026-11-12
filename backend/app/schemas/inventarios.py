from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


# Datos para crear un inventario
class InventariosCrear(BaseModel):
    id_usuario: int
    id_ubicacion: int
    id_producto: int
    id_categoria: int
    id_estado: int
    cantidad_contada: int
    fecha: datetime
    observacion: str | None = None


# Respuesta al registrar un inventario
class InventariosRespuesta(BaseModel):
    id_inventario: int
    id_usuario: int | None = None
    id_ubicacion: int | None = None
    id_producto: int | None = None
    id_categoria: int | None = None
    id_estado: int | None = None
    cantidad_anterior: int
    cantidad_contada: int
    diferencia: int
    fecha: datetime
    observacion: str | None = None

    model_config = ConfigDict(from_attributes=True)


# Respuesta al consultar el listado de inventarios
class InventarioListado(BaseModel):
    id_inventario: int
    id_usuario: int | None = None
    id_ubicacion: int | None = None
    id_producto: int | None = None
    id_categoria: int | None = None
    categoria: str | None = None
    id_estado: int | None = None
    estado: str | None = None
    cantidad_anterior: int
    cantidad_contada: int
    diferencia: int
    fecha: datetime | None = None
    observacion: str | None = None


# Información de cada producto contado
class ProductoInventarioFinalizar(BaseModel):
    id_producto: int
    cantidad_actual: int = Field(ge=0)
    observacion: str | None = None


# Información para finalizar el inventario
class InventarioFinalizar(BaseModel):
    productos: list[ProductoInventarioFinalizar] = Field(min_length=1)