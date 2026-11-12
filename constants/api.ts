
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PUBLICA = 'https://cim-gsm-production.up.railway.app';

function obtenerAPI_URL() {
  // En producción utiliza Railway.
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('railway.app')
  ) {
    return API_PUBLICA;
  }

  // WEB local.
  if (Platform.OS === 'web') {
    const host =
      typeof window !== 'undefined'
        ? window.location.hostname
        : 'localhost';

    return `http://${host}:8000`;
  }

  // ANDROID local con Expo Go.
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
