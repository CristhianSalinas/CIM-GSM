
import pandas as pd
from sqlalchemy import text

from app.config.database import SessionLocal
from app.services.lector_excel import leer_excel
from app.models.producto import Producto
from app.models.marca_producto import MarcaProducto


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


# 2. Limpiar datos
def limpiar(valor):
    if pd.isna(valor):
        return None
    return str(valor).strip()


for columna in ["codigo_sm", "nombre", "descripcion", "referencia"]:
    df[columna] = df[columna].apply(limpiar)

df["codigo_sm"] = df["codigo_sm"].apply(
    lambda x: x.strip() if x else None
)


# 3. Detectar códigos duplicados
duplicados = df[df["codigo_sm"].duplicated(keep=False)]

print("\n========== DUPLICADOS EN EXCEL ==========")
print(duplicados[["codigo_sm", "nombre"]])
print("Total de registros duplicados:", len(duplicados))

if not duplicados.empty:
    raise ValueError("Hay códigos duplicados en el Excel. Corrígelos antes de importar.")


# 4. Identificar marcas
def identificar_marca(nombre, marcas):
    nombre = (nombre or "").upper()

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


# 5. Conectar con MySQL
db = SessionLocal()

nuevos = 0
actualizados = 0
sin_marca = []

try:

    marcas_db = db.execute(
        text("SELECT id_marca, nombre FROM marca_producto")
    ).mappings().all()

    marcas = {
        marca["nombre"].strip().upper(): marca["id_marca"]
        for marca in marcas_db
    }

    productos_db = db.query(Producto).all()

    productos_por_codigo = {
        p.codigo_sm: p for p in productos_db
    }

    # 6. Recorrer Excel
    for _, fila in df.iterrows():

        producto = fila.to_dict()

        codigo = producto["codigo_sm"]

        if not codigo or not producto["nombre"]:
            continue

        producto["id_marca"] = identificar_marca(
            producto["nombre"], marcas
        )

        if producto["id_marca"] is None:
            sin_marca.append(producto)
            continue

        existente = productos_por_codigo.get(codigo)

        if existente:

            # Actualizar producto existente
            existente.nombre = producto["nombre"]
            existente.descripcion = producto["descripcion"]
            existente.referencia = producto["referencia"]
            existente.peso = producto["peso"]
            existente.cantidad_fisica = producto["cantidad_fisica"]
            existente.id_marca = producto["id_marca"]

            actualizados += 1

        else:

            # Insertar producto nuevo
            producto["precio"] = None

            nuevo_producto = Producto(**producto)

            db.add(nuevo_producto)

            # Evitar volver a insertar el mismo código
            productos_por_codigo[codigo] = nuevo_producto

            nuevos += 1

    # 7. Validar marcas
    if sin_marca:
        raise ValueError(
            f"Hay {len(sin_marca)} productos sin marca identificada."
        )

    # 8. Guardar cambios
    db.commit()

    print("\n========== IMPORTACIÓN COMPLETADA ==========")
    print("Registros del Excel:", len(df))
    print("Productos insertados:", nuevos)
    print("Productos actualizados:", actualizados)
    print("Productos sin marca:", len(sin_marca))

except Exception as error:

    db.rollback()

    print("\nError durante la importación:", error)

    raise

finally:
    db.close()
