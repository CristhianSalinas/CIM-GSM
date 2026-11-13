
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import PantallaActual from '../componentes/Ayudas/pantalla_actual';

import {
    obtenerToken,
    tokenExpirado,
    eliminarToken
} from '../constants/auth';

export default function RootLayout() {

    const router = useRouter();
    const segments = useSegments();

    const segmentoActual = segments[0];

    useEffect(() => {

        let activo = true;

        const verificarSesion = async () => {

            try {

                if (!segments.length) return;

                const token = await obtenerToken();

                const estaEnAuth = segmentoActual === '(auth)';

                if (!token) {

                    if (!estaEnAuth && activo) {
                        router.replace('/(auth)/login');
                    }

                    return;
                }

                if (tokenExpirado(token)) {

                    console.log('Sesión expirada. Cerrando sesión...');

                    await eliminarToken();

                    if (activo) {
                        router.replace('/(auth)/login');
                    }

                    return;
                }

                if (estaEnAuth && activo) {
                    router.replace('/(tabs)');
                    return;
                }

                console.log('Sesión vigente');

            } catch (error) {

                console.log('Error verificando sesión:', error);

                await eliminarToken();

                if (activo) {
                    router.replace('/(auth)/login');
                }
            }
        };

        verificarSesion();

        const suscripcion = AppState.addEventListener(
            'change',
            (estado) => {
                if (estado === 'active') {
                    verificarSesion();
                }
            }
        );

        return () => {
            activo = false;
            suscripcion.remove();
        };

    }, [segmentoActual, router]);

    return (
        <>
            <PantallaActual />

            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(auth)/register" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="App" />
                <Stack.Screen name="Pruebas" />
                <Stack.Screen name="index" />
                <Stack.Screen name="pedidos/CrearPedido" />
                <Stack.Screen name="pedidos/CrearSalida" />
            </Stack>
        </>
    );
}
