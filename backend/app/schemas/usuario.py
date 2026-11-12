from pydantic import BaseModel, ConfigDict


class UsuarioCrear(BaseModel):

    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellido: str
    usuario: str
    direccion: str | None = None
    telefono: str | None = None
    correo: str
    password: str
    id_rol: int
    estado: int


class UsuarioRespuesta(BaseModel):

    id_usuario: int
    id_tipo_documento: int
    numero_documento: str
    nombre: str
    apellido: str
    usuario: str
    direccion: str | None = None
    telefono: str | None = None
    correo: str

    model_config = ConfigDict(from_attributes=True)