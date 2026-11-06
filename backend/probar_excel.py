from app.services.lector_excel import leer_excel

# Leer archivo
df = leer_excel("inventario.xls")

# Seleccionar y renombrar columnas
df = df.rename(columns={
    "CODPRODUC": "codigo_sm",
    "DESCRIPCIO": "nombre",
    "DESCRIP2": "descripcion",
    "REFERENCIA": "referencia",
    "PESO": "peso",
    "SALDO": "cantidad_fisica"
})

# Conservar únicamente las columnas necesarias
columnas = [
    "codigo_sm",
    "nombre",
    "descripcion",
    "referencia",
    "peso",
    "cantidad_fisica"
]

df = df[columnas].copy()

# Limpiar códigos y nombres
df["codigo_sm"] = df["codigo_sm"].astype(str).str.strip()
df["nombre"] = df["nombre"].astype(str).str.strip()

# Mostrar resultados
print(df.head(10))

print("\nTotal de productos:", len(df))
print("Códigos duplicados:", df["codigo_sm"].duplicated().sum())
print("Códigos vacíos:", (df["codigo_sm"] == "").sum())
print("Cantidades vacías:", df["cantidad_fisica"].isna().sum())