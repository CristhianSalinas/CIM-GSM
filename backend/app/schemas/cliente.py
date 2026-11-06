from typing import Optional
from pydantic import BaseModel, ConfigDict


class ClienteCrear(BaseModel):
    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellidos: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None



class ClienteRespuesta(BaseModel):
    id_cliente: int
    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellidos: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)