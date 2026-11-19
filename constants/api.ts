
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Si existe una URL de producción, tiene prioridad.
const API_PUBLICA = 'https://cim-gsm-production.up.railway.app';

function obtenerAPI_URL() {
  if (API_PUBLICA) {
    return API_PUBLICA;
  }

  // WEB: utiliza el mismo servidor donde se abre CIM.
  if (Platform.OS === 'web') {
    const host =
      typeof window !== 'undefined'
        ? window.location.hostname
        : 'localhost';

    return `http://${host}:8000`;
  }

  // ANDROID: detecta la IP del computador desde Expo Go.
  const hostExpo = Constants.expoConfig?.hostUri;
  const ipComputador = hostExpo?.split(':')[0];

  if (ipComputador) {
    return `http://${ipComputador}:8000`;
  }

  throw new Error(
    'No se pudo detectar el servidor. Configura EXPO_PUBLIC_API_URL.'
  );
}

export const API_URL = obtenerAPI_URL();



