from pydantic import BaseModel, ConfigDict, Field


class MarcaCrear(BaseModel):
    
    nombre: str = Field(min_length=1, max_length=50)
    


class MarcaRespuesta(BaseModel):
    id_marca: int
    nombre: str
    

    model_config = ConfigDict(from_attributes=True)