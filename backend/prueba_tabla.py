from sqlalchemy import inspect
from app.config.database import engine

inspector = inspect(engine)

tablas = inspector.get_table_names()

print("Tablas encontradas:", tablas)

if "producto" in tablas:
    print("La tabla productos existe.")

    columnas = inspector.get_columns("producto")

    for columna in columnas:
        print(
            "Columna:",
            columna["name"],
            "| Tipo:",
            columna["type"]
        )
else:
    print("No se encontró la tabla productos.")