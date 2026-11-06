from app.services.lector_excel import leer_excel

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

df["codigo_sm"] = df["codigo_sm"].astype(str).str.strip()
df["nombre"] = df["nombre"].astype(str).str.strip()

print(df.head(10))
print("\nTotal de productos:", len(df))

print("\nLongitud máxima de cada campo:")

for columna in ["codigo_sm", "nombre", "descripcion", "referencia"]:
    print(columna, ":", df[columna].astype(str).str.len().max())

print("\nProductos existentes en MySQL:")
print(df[df["codigo_sm"].isin(["SM00007", "SM00199", "SM00400"])])

print("\nDetalle de los productos existentes:")

print(
    df[df["codigo_sm"].isin(
        ["SM00007", "SM00199", "SM00400"]
    )].to_string(index=False)
)