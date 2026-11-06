import pandas as pd
from sqlalchemy import  text
from collections import Counter

from app.config.database import SessionLocal
from app.services.lector_excel import leer_excel
from app.models.producto import Producto




# 1. Leer y preparar Excel
df = leer_excel("inventario.xls")

df = df.rename(columns={
    "CODPRODUC": "codigo_sm",
    "DESCRIPCIO": "nombre",
    "DESCRIP2": "descripcion",
    "REFERENCIA": "referencia",
    "PESO": "peso",
    "SALDO": "cantidad_fisica"
})

columnas = [
    "codigo_sm",
    "nombre",
    "descripcion",
    "referencia",
    "peso",
    "cantidad_fisica"
]

df = df[columnas].copy()


def limpiar(valor):
    if pd.isna(valor):
        return None
    return str(valor).strip()


for columna in ["codigo_sm", "nombre", "descripcion", "referencia"]:
    df[columna] = df[columna].apply(limpiar)


# 2. Identificar marcas por el nombre del producto
def identificar_marca(nombre, marcas):
    nombre = (nombre or "").upper()

    # Se revisan primero las marcas compuestas
    if "AILI O SUMAQ" in nombre:
        buscada = "AILI O SUMAQ"
    elif "BERCH" in nombre:
        buscada = "BERCH"
    elif "AILI" in nombre:
        buscada = "AILI"
    elif "SUMAQ" in nombre:
        buscada = "SUMAQ"
    elif "MDM" in nombre:
        buscada = "MDM"
    else:
         buscada = "ACTUALIZAR"

    return marcas.get(buscada)


# 3. Consultar MySQL
db = SessionLocal()

try:
    productos_existentes = db.execute(
        text("SELECT codigo_sm FROM producto")
    ).scalars().all()

    marcas_db = db.execute(
        text("SELECT id_marca, nombre FROM marca_producto")
    ).mappings().all()

    codigos_existentes = set(productos_existentes)

    marcas = {
        marca["nombre"].strip().upper(): marca["id_marca"]
        for marca in marcas_db
    }

    # 4. Clasificar registros
    nuevos = []
    existentes = []
    sin_marca = []

    for _, fila in df.iterrows():
        producto = fila.to_dict()
        producto["precio"] = None
        codigo = producto["codigo_sm"]

        if not codigo or not producto["nombre"]:
            continue

        if codigo in codigos_existentes:
            existentes.append(producto)
            continue

        producto["id_marca"] = identificar_marca(
            producto["nombre"], marcas
        )

        if producto["id_marca"] is None:
            sin_marca.append(producto)

        nuevos.append(producto)

    # 5. Mostrar simulación
    print("\n========== SIMULACIÓN DE IMPORTACIÓN ==========")

    print("Registros del Excel:", len(df))
    print("Productos existentes en MySQL:", len(existentes))
    print("Productos nuevos:", len(nuevos))
    print("Productos sin marca identificada:", len(sin_marca))

    print("\n========== PRODUCTOS EXISTENTES ==========")

    for producto in existentes:
        print(producto["codigo_sm"], "-", producto["nombre"])

    print("\n========== PRODUCTOS SIN MARCA ==========")

    for producto in sin_marca[:20]:
        print(producto["codigo_sm"], "-", producto["nombre"])

    print("\n========== RESULTADO ==========")

    if sin_marca:
        print("IMPORTACIÓN PENDIENTE: hay marcas por revisar.")
    else:
        print("SIMULACIÓN CORRECTA: no hay marcas pendientes.")

    print("No se insertó ni modificó ningún producto.")


finally:
    db.close()