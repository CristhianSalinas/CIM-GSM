
import pandas as pd
from sqlalchemy import text

from app.config.database import SessionLocal
from app.services.lector_excel import leer_excel
from app.models.producto import Producto
from app.models.marca_producto import MarcaProducto


# =====================================================
# 1. LEER EXCEL
# =====================================================

df = leer_excel("inventario.xls")

df = df.rename(columns={
    "CODPRODUC": "codigo_sm",
    "DESCRIPCIO": "nombre",
    "DESCRIP2": "descripcion",
    "REFERENCIA": "referencia",
    "PESO": "peso",
    "SALDO": "cantidad_fisica",
    "Categoria": "categoria"
})

columnas = [
    "codigo_sm",
    "nombre",
    "descripcion",
    "referencia",
    "peso",
    "cantidad_fisica",
    "categoria"
]

faltantes = [col for col in columnas if col not in df.columns]

if faltantes:
    raise ValueError(f"Faltan columnas en el Excel: {faltantes}")

df = df[columnas].copy()


# =====================================================
# 2. FUNCIONES DE LIMPIEZA
# =====================================================

def limpiar(valor):

    if valor is None or pd.isna(valor):
        return None

    valor = str(valor).strip()
    valor = " ".join(valor.split())

    return valor if valor else None


def limpiar_categoria(valor):

    valor = limpiar(valor)

    return valor.upper() if valor else None


def limpiar_codigo(valor):

    valor = limpiar(valor)

    return valor.upper() if valor else None


def convertir_decimal(valor):

    if valor is None or pd.isna(valor) or valor == "":
        return None

    if isinstance(valor, str):
        valor = valor.strip().replace(",", ".")

    return float(valor)


def convertir_entero(valor):

    if valor is None or pd.isna(valor) or valor == "":
        return 0

    if isinstance(valor, str):
        valor = valor.strip().replace(",", ".")

    return int(float(valor))


# Limpiar columnas
for columna in ["nombre", "descripcion", "referencia"]:
    df[columna] = df[columna].apply(limpiar)

df["codigo_sm"] = df["codigo_sm"].apply(limpiar_codigo)
df["categoria"] = df["categoria"].apply(limpiar_categoria)
df["peso"] = df["peso"].apply(convertir_decimal)
df["cantidad_fisica"] = df["cantidad_fisica"].apply(convertir_entero)


# =====================================================
# 3. VALIDAR CÓDIGOS
# =====================================================

sin_codigo = df[df["codigo_sm"].isna()]

if not sin_codigo.empty:
    raise ValueError(
        f"Hay {len(sin_codigo)} productos sin código."
    )

duplicados = df[df["codigo_sm"].duplicated(keep=False)]

if not duplicados.empty:

    print("\n========== CÓDIGOS DUPLICADOS ==========")
    print(duplicados[["codigo_sm", "nombre"]].to_string(index=False))

    raise ValueError(
        "Existen códigos duplicados en el Excel. "
        "Se canceló la importación."
    )


# =====================================================
# 4. IDENTIFICAR MARCA
# =====================================================

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


# =====================================================
# 5. CONECTAR A MYSQL
# =====================================================

db = SessionLocal()

nuevos = 0
actualizados = 0
sin_marca = []
categorias_no_encontradas = []
omitidos = 0

try:

    # =================================================
    # 6. OBTENER CATEGORÍAS
    # =================================================

    categorias_db = db.execute(
        text("""
            SELECT id_categoria, nombre
            FROM categorias
        """)
    ).mappings().all()

    categorias = {
        limpiar_categoria(c["nombre"]): c["id_categoria"]
        for c in categorias_db
    }

    print("Categorías encontradas en MySQL:", len(categorias))

    # =================================================
    # 7. OBTENER MARCAS
    # =================================================

    marcas_db = db.execute(
        text("""
            SELECT id_marca, nombre
            FROM marca_producto
        """)
    ).mappings().all()

    marcas = {
        limpiar(m["nombre"]).upper(): m["id_marca"]
        for m in marcas_db
        if m["nombre"]
    }

    # =================================================
    # 8. VALIDAR CATEGORÍAS ANTES DE MODIFICAR
    # =================================================

    registros = []

    for _, fila in df.iterrows():

        producto = fila.to_dict()

        codigo = producto["codigo_sm"]
        nombre = producto["nombre"]
        categoria = producto["categoria"]

        if not nombre:
            omitidos += 1
            continue

        id_categoria = categorias.get(categoria)

        if id_categoria is None:

            categorias_no_encontradas.append({
                "codigo": codigo,
                "nombre": nombre,
                "categoria": categoria
            })

            continue

        id_marca = identificar_marca(nombre, marcas)

        registros.append({
            "codigo_sm": codigo,
            "nombre": limpiar(nombre),
            "descripcion": limpiar(producto["descripcion"]),
            "referencia": limpiar(producto["referencia"]),
            "peso": producto["peso"],
            "cantidad_fisica": producto["cantidad_fisica"],
            "id_categoria": id_categoria,
            "id_marca": id_marca
        })

    # Cancelar si existen categorías faltantes
    if categorias_no_encontradas:

        print("\n========== CATEGORÍAS NO ENCONTRADAS ==========")

        for item in categorias_no_encontradas:
            print(item)

        raise ValueError(
            f"Se encontraron {len(categorias_no_encontradas)} "
            "productos con categorías inexistentes. "
            "Se canceló la importación."
        )

    # =================================================
    # 9. OBTENER PRODUCTOS EXISTENTES
    # =================================================

    productos_db = db.query(Producto).all()

    productos_por_codigo = {
        limpiar_codigo(p.codigo_sm): p
        for p in productos_db
        if p.codigo_sm
    }

    # =================================================
    # 10. ACTUALIZAR O INSERTAR PRODUCTOS
    # =================================================

    for producto in registros:

        codigo = producto["codigo_sm"]

        existente = productos_por_codigo.get(codigo)

        if existente:

            # ACTUALIZAR PRODUCTO EXISTENTE

            existente.nombre = producto["nombre"]
            existente.descripcion = producto["descripcion"]
            existente.referencia = producto["referencia"]
            existente.peso = producto["peso"]
            existente.cantidad_fisica = producto["cantidad_fisica"]

            # ASIGNAR CATEGORÍA
            existente.id_categoria = producto["id_categoria"]

            # Conservar marca anterior si no se identifica una nueva
            if producto["id_marca"] is not None:
                existente.id_marca = producto["id_marca"]

            actualizados += 1

        else:

            # INSERTAR PRODUCTO NUEVO

            nuevo_producto = Producto(
                codigo_sm=codigo,
                nombre=producto["nombre"],
                descripcion=producto["descripcion"],
                referencia=producto["referencia"],
                peso=producto["peso"],
                precio=None,
                cantidad_fisica=producto["cantidad_fisica"],
                id_marca=producto["id_marca"],
                id_categoria=producto["id_categoria"],
                id_ubicacion=None
            )

            db.add(nuevo_producto)

            productos_por_codigo[codigo] = nuevo_producto

            nuevos += 1

        if producto["id_marca"] is None:
            sin_marca.append(codigo)

    # =================================================
    # 11. GUARDAR CAMBIOS
    # =================================================

    db.commit()

    print("\n========== IMPORTACIÓN COMPLETADA ==========")

    print("Registros leídos:", len(df))
    print("Productos procesados:", len(registros))
    print("Productos nuevos:", nuevos)
    print("Productos actualizados:", actualizados)
    print("Productos omitidos:", omitidos)
    print("Productos sin marca identificada:", len(sin_marca))

    # =================================================
    # 12. VERIFICAR CATEGORÍAS GUARDADAS
    # =================================================

    print("\n========== VERIFICACIÓN DE CATEGORÍAS ==========")

    db.expire_all()

    productos_verificacion = db.query(Producto).limit(10).all()

    for producto in productos_verificacion:

        print(
            "Código:", producto.codigo_sm,
            "| Nombre:", producto.nombre,
            "| ID categoría:", producto.id_categoria
        )

    total_con_categoria = db.query(Producto).filter(
        Producto.id_categoria.isnot(None)
    ).count()

    total_sin_categoria = db.query(Producto).filter(
        Producto.id_categoria.is_(None)
    ).count()

    print("\n========== RESUMEN DE CATEGORÍAS ==========")
    print("Productos con categoría:", total_con_categoria)
    print("Productos sin categoría:", total_sin_categoria)

    if sin_marca:
        print("\n========== PRODUCTOS SIN MARCA ==========")
        print(sin_marca)

except Exception as error:

    db.rollback()

    print("\n========== ERROR EN LA IMPORTACIÓN ==========")
    print(error)
    print("Se realizó rollback. No se guardaron los cambios.")

    raise

finally:

    db.close()
