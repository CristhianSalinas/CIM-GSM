from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.models import usuario, rol, producto, cliente, detalle_inventario

from app.routes import usuario, clientes, productos, pedido, estado, marca_producto, tipo_documento
from app.routes import entradas_salidas, detalle_pedido, inventarios, ubicacion, historial_movimientos
from app.routes import auth, register, rol, detalle_inventario



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
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "https://cimweb-production.up.railway.app",
        "https://cim-gsm-production.up.railway.app",
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
app.include_router(auth.router)
app.include_router(register.router)
app.include_router(rol.router)
app.include_router(detalle_inventario.router)



@app.get("/")
def inicio():
    return {"mensaje": "API CIM funcionando correctamente"}