from app.config.database import engine

try:
    with engine.connect() as conexion:
        resultado = conexion.exec_driver_sql("SELECT 1")
        print("CONEXIÓN EXITOSA:", resultado.scalar())

except Exception as e:
    print("ERROR DE CONEXIÓN:", e)