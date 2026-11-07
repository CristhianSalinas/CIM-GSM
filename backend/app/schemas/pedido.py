from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PedidoCrear(BaseModel):
  
        numero_pedido: int
        id_cliente: int
        id_estado: int


class PedidoRespuesta(BaseModel):
    id_pedido: int
    numero_pedido: int
    id_cliente: int
    fecha : datetime
    id_estado: int
    id_entrada: int

    model_config = ConfigDict(from_attributes=True)