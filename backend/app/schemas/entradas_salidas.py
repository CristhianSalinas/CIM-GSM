from pydantic import BaseModel, ConfigDict, Field


class Entrada_salidaCrear(BaseModel):
    nombre: str = Field(max_length=15)


class Entrada_salidaRespuesta(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)