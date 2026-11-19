
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime




class PedidoCrear(BaseModel):
    numero_pedido: int
    id_cliente: int
    id_estado: int

class CancelarPedido(BaseModel):
    id_pedido: int


class ProductoPedidoCrear(BaseModel):
    id_producto: int
    cantidad_solicitada: int = Field(gt=0)
    observacion: str | None = None


class PedidoConProductosCrear(BaseModel):
    id_cliente: int
    id_usuario: int
    id_entrada: int
    productos: list[ProductoPedidoCrear] = Field(min_length=1)


class PedidoRespuesta(BaseModel):
    id_pedido: int
    numero_pedido: int
    id_cliente: int
    fecha: datetime
    id_estado: int
    id_entrada: int

    model_config = ConfigDict(from_attributes=True)
