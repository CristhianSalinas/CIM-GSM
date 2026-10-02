import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

export default function App() {
  const [pantalla, setPantalla] = useState('Inicio');

  const mostrarContenido = () => {
    switch (pantalla) {
      case 'Inicio':
        return <Text style={styles.titulo}>Bienvenido al inicio</Text>;

      case 'Galería':
        return <Text style={styles.titulo}>Aquí está la galería</Text>;

      case 'Inventario':
        return <Text style={styles.titulo}>Aquí está el inventario</Text>;

      case 'Perfil':
        return <Text style={styles.titulo}>Aquí está tu perfil</Text>;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>

      {/* CONTENIDO SUPERIOR */}
      <View style={styles.contenido}>
        {mostrarContenido()}
      </View>

      {/* BARRA INFERIOR */}
      <View style={styles.menu}>

        <Pressable
          style={styles.boton}
          onPress={() => setPantalla('Inicio')}
        >
          <Text style={styles.icono}>⌂</Text>
          <Text>Inicio</Text>
        </Pressable>

        <Pressable
          style={styles.boton}
          onPress={() => setPantalla('Galería')}
        >
          <Text style={styles.icono}>▣</Text>
          <Text>Galería</Text>
        </Pressable>

        <Pressable
          style={styles.boton}
          onPress={() => setPantalla('Inventario')}
        >
          <Text style={styles.icono}>▤</Text>
          <Text>Inventario</Text>
        </Pressable>

        <Pressable
          style={styles.boton}
          onPress={() => setPantalla('Perfil')}
        >
          <Text style={styles.icono}>●</Text>
          <Text>Perfil</Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  menu: {
    height: 75,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },

  boton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },

  icono: {
    fontSize: 22,
    marginBottom: 3,
  },
});