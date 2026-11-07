from pydantic import BaseModel, ConfigDict
from datetime import datetime

class InventariosCrear(BaseModel):

        id_usuario: int
        id_ubicacion: int
        id_producto: int
        cantidad_contada: int
        observacion: str | None = None


class InventariosRespuesta(BaseModel):
    id_inventario: int
    id_usuario: int
    id_ubicacion: int
    id_producto: int
    cantidad_anterior: int
    cantidad_contada: int
    fecha : datetime
    observacion: str

    model_config = ConfigDict(from_attributes=True)