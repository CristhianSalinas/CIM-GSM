"""Configuración de conexión a MySQL usando SQLAlchemy."""
import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = URL.create(
	drivername="mysql+pymysql",
	username=os.getenv("DB_USER", "root"),
	password=os.getenv("DB_PASSWORD", ""),
	host=os.getenv("DB_HOST", "localhost"),
	port=int(os.getenv("DB_PORT", "3306")),
	database=os.getenv("DB_NAME", "CIM_DB"),
	query={"charset": "utf8mb4"},
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# verificar conexion
"""if __name__ == "__main__":
    try:
        with engine.connect() as conexion:
            print("¡Conexión con MySQL exitosa!")
    except Exception as e:
        print("Error de conexión:", e)
"""

def get_db():
	"""Proporciona una sesión de base de datos y la cierra al terminar."""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()

		
