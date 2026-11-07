from pydantic import BaseModel, ConfigDict


class UsuarioCrear(BaseModel):
    
    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None

class UsuarioRespuesta(BaseModel):
    id_usuario: int
    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellido: str
    direccion: str | None = None
    telefono: str | None = None


    model_config = ConfigDict(from_attributes=True)