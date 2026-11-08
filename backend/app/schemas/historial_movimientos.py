from pydantic import BaseModel, ConfigDict
from datetime import datetime

class MovimientosCrear(BaseModel):

    id_detalle: int
    id_usuario: int
    id_movimentos: int
    id_pedido: int
    id_producto: int
    cantidad: int
    observacion: str | None = None


class MovimientosRespuesta(BaseModel):
    id: int
    id_usuario: int
    id_pedido: int
    id_cliente: int
    id_movimentos: int
    id_producto: int
    cantidad: int
    fecha : datetime
    observacion: str

    model_config = ConfigDict(from_attributes=True)

        