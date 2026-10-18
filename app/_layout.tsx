import { Stack } from 'expo-router';
// Importa el componente PantallaActual
import PantallaActual from '../componentes/Ayudas/pantalla_actual';

export default function RootLayout() {
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