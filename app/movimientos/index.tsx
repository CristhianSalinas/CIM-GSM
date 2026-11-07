import { View, Text, Pressable } from 'react-native';
import { StyleSheet, Button, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';


import BotonInicio from '../../componentes/botones/boton_inicio';

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <BotonInicio />
      <Text>Control de Mercancía</Text>

      <Pressable style={styles.button} onPress={() => router.push('/movimientos/pedidos_ingreso')}>
        <Text style={styles.buttontext}>Ingreso de mercancía</Text>
      </Pressable>
  

    <Pressable style={styles.button} onPress={() => router.push('/movimientos/pedidos_salida')}>
        <Text style={styles.buttontext}>Salidas de mercancía</Text>
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