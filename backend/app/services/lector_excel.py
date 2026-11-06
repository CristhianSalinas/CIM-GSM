import pandas as pd

def leer_excel(ruta_archivo: str):
    try:

        if ruta_archivo.endswith(".xls"):
            df = pd.read_excel(ruta_archivo, engine="xlrd")
        else:
            df = pd.read_excel(ruta_archivo, engine="openpyxl")


        df.columns = df.columns.str.strip()
        df = df.astype(object).where(pd.notna(df), None)

        return df

    except FileNotFoundError:
        raise FileNotFoundError(
            f"No se encontró el archivo: {ruta_archivo}"
        )

    except Exception as error:
        raise Exception(
            f"Error al leer el Excel: {error}"
        )