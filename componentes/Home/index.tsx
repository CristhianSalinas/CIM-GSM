import { View, Text, StyleSheet, Pressable, Button, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.cards}>

        <Pressable
          style={styles.card}
          //onPress={() => router.push('/productos')}
         onPress={() => showAlert('Pressable button pressed')}
        >
          <Text style={styles.number}>Stock</Text>
          <Text style={styles.label}>Productos</Text>
        </Pressable >

        <Pressable
          style={styles.card}
          //onPress={() => router.push('/inventario')}
          onPress={() => showAlert('Pressable button pressed')}
        >
          <Text style={styles.number}>Realizar</Text>
          <Text style={styles.label}>Inventario</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/metricas')}
        >
          <Text style={styles.number}>Métricas</Text>
          <Text style={styles.label}>Métricas</Text>
        </Pressable>

      </View>
    </View>
  );
}

   function showAlert(message: string) {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(message);
    }
  }

  function onPressFunction() {
  console.log('Presionaste el botón');
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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