from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCrear

password_hash = PasswordHash.recommended()

def registrar_usuario(db: Session, datos: UsuarioCrear):

    try:
        # 1. Validar si el usuario ya existe
        usuario_existente = db.query(Usuario).filter(
            Usuario.usuario == datos.usuario
        ).first()

        if usuario_existente:
            raise ValueError("El usuario ya existe.")

        # 2. Validar si el documento ya existe
        documento_existente = db.query(Usuario).filter(
            Usuario.numero_documento == datos.numero_documento
        ).first()

        if documento_existente:
            raise ValueError("El documento ya está registrado.")

        # 3. Crear el objeto usuario
        nuevo_usuario = Usuario(
            id_tipo_documento=datos.id_tipo_documento,
            numero_documento=datos.numero_documento,
            usuario=datos.usuario,
            nombre=datos.nombre,
            apellido=datos.apellido,
            telefono=datos.telefono,
            direccion=datos.direccion,
            correo=datos.correo,
            password_hash=password_hash.hash(datos.password),
            id_rol=datos.id_rol,
            estado=datos.estado
        )

        # 4. Guardar en la base de datos
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        return nuevo_usuario

    except ValueError:
        raise

    except Exception:
        db.rollback()
        raise

    # 4. Devolver el usuario creado
    return nuevo_usuario