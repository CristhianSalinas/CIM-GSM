
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    exp?: number;
}



const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';


export const tokenExpirado = (token: string): boolean => {
    try {
        const datos = jwtDecode<TokenPayload>(token);

        if (!datos.exp) {
            return true;
        }

        // exp viene expresado en segundos
        const ahora = Math.floor(Date.now() / 1000);

        return datos.exp <= ahora;

    } catch (error) {
        return true;
    }
};

// Guardar token después del login
export const guardarToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

// Recuperar token
export const obtenerToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

// Guardar información del usuario
export const guardarUsuario = async (usuario: any) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

// Obtener información del usuario
export const obtenerUsuario = async () => {
    const usuario = await AsyncStorage.getItem(USER_KEY);
    return usuario ? JSON.parse(usuario) : null;
};

// Cerrar sesión
export const eliminarToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};



