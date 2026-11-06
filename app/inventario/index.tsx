import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useEffect, useState } from 'react';

import BotonInicio from '../../componentes/botones/boton_inicio';

interface Producto {
  id_producto: number;
  codigo_sm: string;
  nombre: string;
  id_marca: number;
  referencia: string;
  descripcion: string;
  precio: number;
  cantidad_fisica: number;
}
/*interface Producto { 
    id: number; 
    nombre: string; 
    categoria: string; 
    cantidad: number; 
    estado: 'Disponible' | 'Agotado'; 
    codigo: string;
}*/

export default function Conteo(){
  /*const datos = categorias as Producto[];*/
  const API_URL = "http://127.0.0.1:8000";
  const [productos, setProductos] = useState<Producto[]>([]);

  const cargarProductos = async () => {
      try {
            const respuesta = await fetch(`${API_URL}/api/productos`);
            
          if (!respuesta.ok) {
                    throw new Error(`Error HTTP: ${respuesta.status}`);
                  }
            
            const datos = await respuesta.json();
            
            setProductos(datos);
          } catch (error) {
            console.log("Error al cargar productos:", error);
         }
         
  };
  

  

    useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <View style={styles.container}>

  <BotonInicio />

      <Text style={styles.title}>Conteo Físico</Text>

      <Text style={styles.subtitle}>
        Ajuste y Control de productos y existencias
      </Text>

      <Text style={styles.subtitle}>
        Selecciona una categoria para iniciar con el conteo físico de productos y verificar su stock.
      </Text>

      <View style={styles.cards}>

        <View style={styles.card}>
          <Text style={styles.number}>129</Text>
          <Text style={styles.label}>Productos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>24</Text>
          <Text style={styles.label}>Categorías</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>5</Text>
          <Text style={styles.label}>Stock bajo</Text>
        </View>

      </View>


      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Producto</Text>
        <Text style={styles.headerText}>Stock</Text>
      </View>

      <Text style={styles.subtitle}>
        Barra de busqueda
      </Text>
      <ScrollView>
        {productos.map((item) => (
          <View key={item.id_producto} style={styles.product}>

            <View>
              <Text style={styles.name}>
                {item.nombre}
              </Text>

              <Text style={styles.category}>
                {item.codigo_sm}
              </Text>
            </View>


            <View>
              <Text style={styles.stock}>
                {item.cantidad_fisica}
              </Text>

            {/*  <Text style={
                item.estado === 'Disponible'
                ? styles.available
                : styles.warning
              }>
                {item.estado}
              </Text>*/}
            </View>

          </View>
        ))}
      </ScrollView>


    </View>
  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#F5F7FB',
    padding:20
  },

  title:{
    fontSize:32,
    fontWeight:'bold',
    color:'#111827'
  },

  subtitle:{
    color:'#6B7280',
    marginBottom:20
  },


  cards:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:25
  },


  card:{
    backgroundColor:'#fff',
    width:'31%',
    padding:15,
    borderRadius:15,
    alignItems:'center',
    elevation:3
  },

  number:{
    fontSize:25,
    fontWeight:'bold',
    color:'#2563EB'
  },

  label:{
    fontSize:12,
    color:'#6B7280'
  },


  tableHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#111827',
    padding:15,
    borderRadius:10
  },

  headerText:{
    color:'#fff',
    fontWeight:'bold'
  },


  product:{
    backgroundColor:'#fff',
    marginTop:10,
    padding:18,
    borderRadius:12,
    flexDirection:'row',
    justifyContent:'space-between',
    elevation:2
  },


  name:{
    fontSize:16,
    fontWeight:'bold',
    color:'#111827'
  },

  category:{
    color:'#6B7280',
    marginTop:5
  },


  stock:{
    fontSize:20,
    fontWeight:'bold',
    textAlign:'right'
  },

  available:{
    color:'#16A34A',
    fontSize:12
  },

  warning:{
    color:'#DC2626',
    fontSize:12
  }

});