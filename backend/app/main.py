from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import usuario
from app.routes import clientes
from app.routes import productos
from app.routes import pedido
from app.routes import estado
from app.routes import marca_producto
from app.routes import tipo_documento
from app.routes import entradas_salidas
from app.routes import detalle_pedido
from app.routes import inventarios
from app.routes import ubicacion
from app.routes import historial_movimientos

# Crear aplicación
app = FastAPI(
    title="CIM - Grupo Supermáquinas",
    description="Sistema de gestión de inventarios",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cimweb-production.up.railway.app"
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
app.include_router(inventarios.router)
app.include_router(ubicacion.router)
app.include_router(historial_movimientos.router)
app.include_router(estado.router)


@app.get("/")
def inicio():
    return {"mensaje": "API CIM funcionando correctamente"}