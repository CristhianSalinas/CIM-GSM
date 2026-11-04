from fastapi import FastAPI

from app.routes import usuario
from app.routes import clientes
from app.routes import productos
from app.routes import marca_producto
from app.routes import tipo_documento

# Crear aplicación
app = FastAPI(
    title="CIM - Grupo Supermáquinas",
    description="Sistema de gestión de inventarios",
    version="1.0.0"
)

# Registrar rutas
app.include_router(usuario.router)
app.include_router(clientes.router)
app.include_router(productos.router)
app.include_router(marca_producto.router)
app.include_router(tipo_documento.router)


@app.get("/")
def inicio():
    return {"mensaje": "API CIM funcionando correctamente"}