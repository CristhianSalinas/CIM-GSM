from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

password = ""

hash_generado = password_hash.hash(password)

print(hash_generado)