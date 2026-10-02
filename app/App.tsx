import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router';


import { NavigationContainer } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//importacion de estilos


// Componentes
import Home from './componentes/Home';
import Pruebas from './componentes/Pruebas';
import Login from './componentes/Login';
import Inventario from './componentes/Inventario';
import Barcat from './componentes/barcat';
//Fin componentes

export default function App() {
  return (
    
    <View>
      <view>Inventario</view>
      
    </View>
  );
}

const styles = StyleSheet.create({
 
});
