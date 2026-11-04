from pydantic import BaseModel, ConfigDict


class ProductoCrear(BaseModel):
    codigo_sm: str
    nombre: str
    id_marca: int
    referencia: str
    precio: int


class ProductoRespuesta(BaseModel):
    id_producto: int
    codigo_sm: str
    nombre: str
    precio: int

    model_config = ConfigDict(from_attributes=True)