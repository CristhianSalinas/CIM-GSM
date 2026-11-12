import { Tabs } from 'expo-router';


export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
     <Tabs.Screen
        name="inventario"
        options={{ title: 'Inventario' }}
      />
      
      <Tabs.Screen
        name="movimientos"
        options={{ title: 'Movimientos' }}
      />
    </Tabs>

    
  );
}