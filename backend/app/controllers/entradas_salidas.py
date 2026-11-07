from sqlalchemy.orm import Session
from app.models.entradas_salidas import Entrada_Salida
from app.schemas.entradas_salidas import Entrada_salidaCrear


def obtener_entrada_salida(db: Session):
    return db.query(Entrada_Salida).all()

def crear_entrada_salida(db: Session, datos:Entrada_salidaCrear):
    nueva_entrada_salida = Entrada_Salida(**datos.model_dump())

    db.add(nueva_entrada_salida)
    db.commit()
    db.refresh(nueva_entrada_salida)

    return nueva_entrada_salida