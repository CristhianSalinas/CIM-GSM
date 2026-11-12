
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

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



