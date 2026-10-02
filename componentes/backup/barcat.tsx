import { View, Text, StyleSheet, Pressable, Button, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, CSSProperties} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';


import Home from '../Home';
import Pruebas from '../Pruebas';
import Login from '../Login';
import Inventario from '../Inventario';


export default function Barcat() {
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
      <View style={styles.container}>
        <Router>
          <View style={styles.bottomMenu}>
            <Link to="../Home" style={styles.menuItem}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDy9mBtyJWUPLRobv__N2OwHYdiKAWarKroQ&s"
              />
              <Text>Home</Text>
            </Link>

            <Link to="../Login" style={styles.menuItem}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwirKiGL1VFlx1A456XT5nxNyWds8y4-K5zg&s"
              />
              <Text>Login</Text>
            </Link>

            <Link to="../Inventario" style={styles.menuItem}>
              <img
                src="https://media.istockphoto.com/id/1448912272/vector/soccer-ball-icon-football-game-ball-icons.jpg?s=170667a&w=0&k=20&c=BppyhfxxHRxTSk_1urxYxFTh9a-UprsyYm5vI0XC7Lg="
              />
              <Text>Inventario</Text>
            </Link>
          </View>

          <Routes>
            <Route path="../Home" element={<Home />} />
            <Route path="../Login" element={<Login />} />
            <Route path="../Inventario" element={<Inventario />} />
          </Routes>
        </Router>
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

  container: {
    margin: 0,
    padding: 0,
  },
  
  number: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  label: {
    fontSize: 16,
    marginTop: 10,
  },

  bottomMenu: {
  position: 'absolute',
 

  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',

  backgroundColor: '#111827',
  paddingVertical: 10,
},

menuItem: {
  alignItems: 'center',
},
});

