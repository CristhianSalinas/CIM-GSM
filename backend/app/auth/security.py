import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from pwdlib import PasswordHash


SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CAMBIAR_POR_UNA_CLAVE_SEGURA")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


# Generar hash de contraseña
def encriptar_password(password: str):
    return password_hash.hash(password)


# Verificar contraseña
def verificar_password(password: str, password_guardado: str):
    return password_hash.verify(password, password_guardado)


# Generar token JWT
def crear_access_token(datos: dict):
    datos_token = datos.copy()

    expiracion = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    datos_token.update({"exp": expiracion})

    token = jwt.encode(
        datos_token,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# Decodificar token JWT
def verificar_token(token: str):
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )