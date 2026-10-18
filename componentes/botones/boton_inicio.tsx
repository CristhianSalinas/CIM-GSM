import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BotonInicio() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.boton}
      onPress={() => router.replace('/')}
    >
      <Text style={styles.texto}>← inicio</Text>
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
    width:'10%',
    alignItems:'center',
    elevation:3
    
  },

  texto: {
    fontSize: 16,
  },
});