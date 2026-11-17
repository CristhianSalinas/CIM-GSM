from typing import Optional
from pydantic import BaseModel, ConfigDict


class CategoriasCrear(BaseModel):
    nombre: str




class CategoriasRespuesta(BaseModel):
    id_categoria: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)