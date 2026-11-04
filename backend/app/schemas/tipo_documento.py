from pydantic import BaseModel, ConfigDict, Field


class TipoDocumentoCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=50)


class TipoDocumentoRespuesta(BaseModel):
    id_tipo: int
    nombre: str


    model_config = ConfigDict(from_attributes=True)