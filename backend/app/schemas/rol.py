from pydantic import BaseModel, ConfigDict, Field


class RolCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=50)


class RolRespuesta(BaseModel):
    id_rol: int
    nombre: str


    model_config = ConfigDict(from_attributes=True)