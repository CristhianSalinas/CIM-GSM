import { View, Text, StyleSheet,Pressable, Button, alert, ScrollView, Platform } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";

import categorias from '../data/Categorias.json';

export default function Pruebas() {

  function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Ingreso Productos</Text>
      <Text style={styles.subtitle}>
        Productos nuevos o ingresos
      </Text>

      <View style={styles.cards}>

        <View style={styles.card}>
          <Text style={styles.number}>+128</Text>
          <Text style={styles.label}>Productos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>+24</Text>
          <Text style={styles.label}>Categorías</Text>
        </View>

        <View>
          
        </View> 

      </View>


      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>SM</Text>
        <Text style={styles.headerText}>Producto</Text>
        <Text style={styles.headerText}>Cantidad</Text>
      </View>


      <ScrollView>
        {categorias.map((item) => (
          <View key={item.id} style={styles.product}>
            
            <View>
              <Text style={styles.code}>
                {item.codigo}
              </Text>
            </View>

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
<View>
        <Button
          title="Press me"
          onPress={() => showAlert('Simple Button pressed')}
        /><Button
            title="Right button"
            onPress={() => showAlert('Right button pressed')}
          /><Pressable style={styles.buttonCMS} onPress={() => showAlert('Pressable button pressed')}>
          <Text style={{color:'#fff'}}>Pressable Button</Text>
        </Pressable>
        <Pressable  
          onPress={() => {
            setTimesPressed(current => current + 1);
          }}
          style={({pressed}) => [
            {
              backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
            },
            styles.wrapperCustom,
          ]}>
          {({pressed}) => (
            <Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>
          )}
        </Pressable>
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

  buttonCMS:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#111827',
    padding:15,
    borderRadius:10
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

  code:{
    fontSize:14,
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