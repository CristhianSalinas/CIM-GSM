import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BotonVolver() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.boton,
        pressed && styles.botonPresionado 
      ]}
      onPress={() => router.back()}
    >
      <Text style={styles.texto}>← Volver</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: '#c48703',
    paddingVertical: 10,
    paddingHorizontal: 16, 
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  
    elevation: 3,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  botonPresionado: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }], 
  },
  texto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
