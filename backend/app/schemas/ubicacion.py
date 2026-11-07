from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column


class UbicacionCrear(BaseModel):
    
    nombre: str
    zona: str
    estante: str
    nivel: str | None = None
    descripcion: str | None = None

class UbicacionRespuesta(BaseModel):
    id_ubicacion: int
    nombre: str
    zona: str
    estante: str
    nivel: str | None = None
    descripcion: str | None = None


    model_config = ConfigDict(from_attributes=True)


