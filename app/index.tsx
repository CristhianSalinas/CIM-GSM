import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <Text>Inicio CIM</Text>

      <Pressable onPress={() => router.push('/inventario')}>
        <Text>Ir a Inventario</Text>
      </Pressable>
    </View>
  );
}