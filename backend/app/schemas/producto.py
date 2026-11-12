
from pydantic import BaseModel, ConfigDict


class ProductoCrear(BaseModel):
    codigo_sm: str
    nombre: str
    id_marca: int | None = None
    id_categoria: int | None = None
    descripcion: str | None = None
    referencia: str | None = None
    peso: float | None = None
    precio: int | None = None
    cantidad_fisica: int | None = None


class ProductoRespuesta(BaseModel):
    id_producto: int
    codigo_sm: str | None = None
    nombre: str | None = None
    id_marca: int | None = None
    id_categoria: int | None = None
    descripcion: str | None = None
    referencia: str | None = None
    peso: float | None = None
    precio: int | None = None
    cantidad_fisica: int | None = None

    model_config = ConfigDict(from_attributes=True)
