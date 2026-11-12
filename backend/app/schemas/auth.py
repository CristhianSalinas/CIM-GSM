from pydantic import BaseModel


class LoginRequest(BaseModel):
    usuario: str
    password: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str
    id_usuario: int
    nombre: str
    usuario: str
    id_rol: int