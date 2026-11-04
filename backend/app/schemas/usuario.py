from pydantic import BaseModel, ConfigDict, Field


class UsuarioCrear(BaseModel):
    
    id_tipo_documento: int
    numero_documento: int
    nombre: str
    apellido: str
    direccion: str
    telefono: str

class UsuarioRespuesta(BaseModel):
    id_usuario: int
    id_tipo_documento: int
    numero_documento: int
    nombre: str
    apellido: str
    direccion: str
    telefono: str


    model_config = ConfigDict(from_attributes=True)