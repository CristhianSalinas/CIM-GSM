from pydantic import BaseModel, ConfigDict, Field


class EstadoCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=50)



class EstadoRespuesta(BaseModel):
    id_estado: int
    nombre: str


    model_config = ConfigDict(from_attributes=True)