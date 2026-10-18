import { Tabs } from 'expo-router';


export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
     <Tabs.Screen
        name="inventario"
        options={{ title: 'Inventario' }}
      />
      
      <Tabs.Screen
        name="conteo_fisico"
        options={{ title: 'Conteo físico' }}
      />

      <Tabs.Screen
        name="entradas_salidas_movimientos"
        options={{ title: 'Movimientos' }}
      />
    </Tabs>
  );
}