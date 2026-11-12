import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

// Importa el componente PantallaActual
import PantallaActual from '../componentes/Ayudas/pantalla_actual';

import { obtenerToken } from '../constants/auth';

export default function RootLayout() {

    const router = useRouter();
    const segments = useSegments();

    const segmentoActual = segments[0];
    
    useEffect(() => {

        const verificarSesion = async () => {

            try {
                const token = await obtenerToken();

                // No hay sesión y no está en login
                if (!token && segmentoActual !== 'login') {
                    router.replace('/login');
                    return;
                }

                // Ya tiene sesión e intenta entrar al login
                if (token && segmentoActual === 'login') {
                    router.replace('/(tabs)');
                }

            } catch (error) {
                console.log('Error verificando sesión:', error);
                router.replace('/login');
            }
        };

        verificarSesion();

    }, [segmentoActual]);


  return (
    <>  
    
      <PantallaActual />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
      </Stack>
      
    </>
  );
}