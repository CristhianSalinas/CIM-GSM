from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class PedidoCrear(BaseModel):
  
        numero_pedido: int
        id_cliente: int
        id_estado: int


class PedidoConProductosCrear(BaseModel):
    id_cliente: int
    productos: list[ProductoPedidoCrear]

    
class ProductoPedidoCrear(BaseModel):
    id_producto: int
    cantidad: int = Field(gt=0)

class PedidoRespuesta(BaseModel):
    id_pedido: int
    numero_pedido: int
    id_cliente: int
    fecha : datetime
    id_estado: int
    id_entrada: int

    model_config = ConfigDict(from_attributes=True)