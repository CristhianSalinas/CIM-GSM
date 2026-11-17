
import { Stack } from 'expo-router';

import PantallaActual from '../componentes/Ayudas/pantalla_actual';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {

    return (
        <AuthProvider>

            <PantallaActual />

            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(auth)/register" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="index" />
                <Stack.Screen name="pedidos/CrearPedido" />
                <Stack.Screen name="pedidos/CrearSalida" />
            </Stack>

        </AuthProvider>
    );
}
