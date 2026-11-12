from pydantic import BaseModel, ConfigDict
from datetime import datetime


class DetalleInventarioCrear(BaseModel):
    id_inventario: int
    id_usuario: int
    id_producto: int

    cantidad_anterior: int
    cantidad_actual: int

    observacion: str | None = None


class DetalleInventarioRespuesta(BaseModel):
    id_detalle_inventario: int
    id_inventario: int
    id_usuario: int
    id_producto: int

    cantidad_anterior: int
    cantidad_actual: int
    diferencia: int

    observacion: str | None = None
    fecha: datetime

    model_config = ConfigDict(from_attributes=True)