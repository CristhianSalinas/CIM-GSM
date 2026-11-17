from pydantic import BaseModel, ConfigDict,Field
from datetime import datetime


class MovimientosCrear(BaseModel):

    id_usuario: int
    id_movimentos: int
    id_pedido: int
    id_producto: int
    id_detalle: int
    id_estado: int
    id_inventario: int | None = None
    cantidad: int
    observacion: str | None = None


class MovimientosRespuesta(BaseModel):
    id: int
    id_usuario: int
    id_movimentos: int
    id_pedido: int
    id_producto: int
    id_estado: int
    id_inventario: int
    id_detalle: int
    cantidad: int
    observacion: str
    fecha : datetime
    

    model_config = ConfigDict(from_attributes=True)



class MovimientoInventarioCrear(BaseModel):
    id_usuario: int
    id_inventario: int
    id_producto: int
    cantidad: int = Field(ge=0)
    observacion: str | None = None
        