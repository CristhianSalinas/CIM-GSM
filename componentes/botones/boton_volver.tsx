import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BotonVolver() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.boton}
      onPress={() => router.back()}
    >
      <Text style={styles.texto}>← Volver</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#c48703',
    marginBottom: 20,
    borderRadius: 8,
    width:'30%',
    alignItems:'center',
    elevation:3,
  },

  texto: {
    fontSize: 16,
  },
});