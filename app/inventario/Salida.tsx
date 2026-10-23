import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

import categorias from '../../data/Categorias.json';
import BotonInicio from '../../componentes/botones/boton_inicio';
import BotonVolver from '../../componentes/botones/boton_volver';

interface Producto { 
    id: number; 
    nombre: string; 
    categoria: string; 
    cantidad: number; 
    estado: 'Disponible' | 'Agotado'; 
    codigo: string;
}

export default function Inventario(){
  const datos = categorias as Producto[];
  return (
    <View style={styles.container}>
      <BotonVolver />

      <Text style={styles.title}>Entrega de mercancía</Text>

      <Text style={styles.subtitle}>
        Entrega de productos y existencias, por favor asegúrese de que la información sea correcta antes de proceder con la entrega de mercancía. y que el producto se encuentre en buen estado y cumpla con los estándares de calidad requeridos.
      </Text>

      <View style={styles.cards}>

        <View style={styles.card}>
          <Text style={styles.number}>5</Text>
          <Text style={styles.label}>Productos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>2</Text>
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


      <ScrollView>
        {categorias.map((item) => (
          <View key={item.id} style={styles.product}>

            <View>
              <Text style={styles.name}>
                {item.nombre}
              </Text>

              <Text style={styles.category}>
                {item.categoria}
              </Text>
            </View>


            <View>
              <Text style={styles.stock}>
                {item.cantidad}
              </Text>

              <Text style={
                item.estado === 'Disponible'
                ? styles.available
                : styles.warning
              }>
                {item.estado}
              </Text>
            </View>

          </View>
        ))}
      </ScrollView>

      <View style={styles.cards}>

        <View style={styles.card}>
          <Text style={styles.number}>5</Text>
          <Text style={styles.label}>Productos</Text>
        </View>
        
        <Image style={styles.logo}
                       source={require('../../img/no_correcto.png')} 
                    />

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#F5F7FB',
    padding:20
  },

  logo: {
    width: 66,
    height: 58,
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
    elevation:2,
    
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