from pydantic import BaseModel, ConfigDict


class ProductoCrear(BaseModel):
    codigo_sm: str
    nombre: str
    id_marca: int | None = None
    descripcion: str | None = None
    referencia: str | None = None
    precio: int | None = None


class ProductoRespuesta(BaseModel):
    id_producto: int
    codigo_sm: str
    nombre: str
    descripcion: str | None = None
    id_marca: int | None = None
    referencia: str | None = None
    cantidad_fisica: int | None = None
    precio: int | None = None

    model_config = ConfigDict(from_attributes=True)