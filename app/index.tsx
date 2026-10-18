import { View, Text, Pressable } from 'react-native';
import { StyleSheet, Button, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <Text>Inicio CIM</Text>

      <Pressable style={styles.button} onPress={() => router.push('/inventario')}>
        <Text style={styles.buttontext}>Inventario</Text>
      </Pressable>  

    <Pressable style={styles.button} onPress={() => router.push('/inventario/movimientos')}>
        <Text style={styles.buttontext}>Movimientos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },

  buttontext: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0e4dd4',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
  },

  buttonCMS:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#111827',
    padding:15,
    borderRadius:10
  },

  number: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  label: {
    fontSize: 16,
    marginTop: 10,
  },
});