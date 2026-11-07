from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import usuario
from app.routes import clientes
from app.routes import productos
from app.routes import pedido
from app.routes import marca_producto
from app.routes import tipo_documento
from app.routes import entradas_salidas
from app.routes import detalle_pedido

# Crear aplicación
app = FastAPI(
    title="CIM - Grupo Supermáquinas",
    description="Sistema de gestión de inventarios",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(usuario.router)
app.include_router(clientes.router)
app.include_router(productos.router)
app.include_router(marca_producto.router)
app.include_router(tipo_documento.router)
app.include_router(entradas_salidas.router)
app.include_router(pedido.router)
app.include_router(detalle_pedido.router)


@app.get("/")
def inicio():
    return {"mensaje": "API CIM funcionando correctamente"}