from pydantic import BaseModel, ConfigDict


class DetalleInventarioCrear(BaseModel):
    id_inventario: int
    id_producto: int
    cantidad_contada: int
    observacion: str | None = None


class DetalleInventarioRespuesta(BaseModel):
    id_detalles_inventario: int
    id_inventario: int
    id_estado: int
    id_producto: int
    cantidad_anterior: int
    cantidad_contada: int
    diferencia: int
    observacion: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CancelarInventarioRequest(BaseModel):
    id_inventario: int