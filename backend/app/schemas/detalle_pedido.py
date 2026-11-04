from pydantic import BaseModel, ConfigDict, Field


class DetallePedidoCrear(BaseModel):
    id_pedido: int
    id_producto: int
    cantidad_solicitada: int = Field(gt=0)
    cantidad_despachada: int = Field(default=0, ge=0)


class DetallePedidoRespuesta(BaseModel):
    id_detalle: int
    id_pedido: int
    id_producto: int
    cantidad_solicitada: int
    cantidad_despachada: int

    model_config = ConfigDict(from_attributes=True)