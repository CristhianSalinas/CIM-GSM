import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';


import { NavigationContainer } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//importacion de estilos
import './App.css'

// Componentes
import Home from './componentes/Home';
import Pruebas from './componentes/Pruebas';
import Login from './componentes/Login';
import Inventario from './componentes/Inventario';
//Fin componentes

export default function App() {
  return (
    
    <View style={styles.container}>
      <Router>
      <nav className='c-menu'>
        <Link to="/componentes/Home"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDy9mBtyJWUPLRobv__N2OwHYdiKAWarKroQ&s" /><p>Home</p></Link>
        <Link to="/componentes/Login"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwirKiGL1VFlx1A456XT5nxNyWds8y4-K5zg&s" /><p>login</p></Link>
        <Link to="/componentes/Inventario"><img src="https://media.istockphoto.com/id/1448912272/vector/soccer-ball-icon-football-game-ball-icons.jpg?s=170667a&w=0&k=20&c=BppyhfxxHRxTSk_1urxYxFTh9a-UprsyYm5vI0XC7Lg=" /><p>Inventario</p></Link>
      </nav>

          <Routes>
            <Route path="/componentes/Home" element={<Home/>} />
            <Route path="/componentes/Login" element={<Login/>} />
            <Route path="/componentes/Inventario" element={<Inventario/>} />
          </Routes>     
       </Router>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
