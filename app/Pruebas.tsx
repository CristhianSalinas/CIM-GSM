import { View, Text, StyleSheet, ScrollView, Image  } from 'react-native';
import { Button, DataTable } from 'react-native-paper';


import categorias from '../data/Categorias.json';
import BotonInicio from '../componentes/botones/boton_inicio';
import BotonVolver from '../componentes/botones/boton_volver';

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
      <BotonInicio />

      <Button mode="contained" onPress={() => console.log('¡Funciona!')}>
        Prueba Paper
      </Button>

      <Text style={styles.title}>Ingreso de mercancía</Text>

      <Text style={styles.subtitle}>
        Ingreso de productos y existencias
      </Text>


      <Text style={styles.subtitle}>
          Productos y existencias a ingresar en el inventario. Asegúrese de que la información sea correcta antes de proceder con el ingreso de mercancía.
        </Text>
      <View style={styles.cards}>
        

        <View style={styles.card}>
          <Text style={styles.number}>1000</Text>
          <Text style={styles.label}>Productos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>5</Text>
          <Text style={styles.label}>Categorías</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>2</Text>
          <Text style={styles.label}>inconsistencias</Text>
        </View>

      </View>


     {/* <View style={styles.tableHeader}>
        <Text style={styles.headerText}>CODIGO</Text>
        <Text style={styles.headerText}>Producto</Text>
        <Text style={styles.headerText}>Cantidad</Text>
        <Text style={styles.headerText}>Stock</Text>
        <Text style={styles.headerText}>  </Text>
      </View>*/}

      
      {/*<ScrollView>
        {categorias.map((item) => (
          <View key={item.id} style={styles.product}>

            <View>
              <Text style={styles.name}>
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

            <View></View>
            <View style={styles.contenedorFila}>
              <Image style={styles.logo}
               source={require('../../img/no_correcto.png')} 
            />
              <Image style={styles.logo}
               source={require('../../img/controlar.png')} 
            />
            </View>


          </View>
        ))}
      </ScrollView>
      */}

      <View style={styles.container}>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>

              <DataTable.Title>
                <Text style={styles.headerText}>Codigo</Text>
              </DataTable.Title>

              <DataTable.Title>
                <Text style={styles.headerText}>Producto</Text>
              </DataTable.Title>

              <DataTable.Title>
                <Text style={styles.headerText}>Cantidad</Text>
              </DataTable.Title>

              <DataTable.Title>
                <Text style={styles.headerText}>Stock</Text>
              </DataTable.Title>

              <DataTable.Title>
                <Text style={styles.headerText}>¿Es Correcto?</Text>
              </DataTable.Title>

            </DataTable.Header>
          </DataTable>

          <ScrollView>
            <DataTable>
              {categorias.map((item) => ( 
                  <DataTable.Row key={item.id} style={styles.product}>

                      <DataTable.Cell>
                        <Text style={styles.cellText}>{item.codigo}</Text>
                      </DataTable.Cell>

                      <DataTable.Cell>
                        <Text style={styles.cellText}>{item.nombre}</Text>
                      </DataTable.Cell>

                      <DataTable.Cell>
                        <Text style={styles.cellText}>{item.categoria}</Text>
                      </DataTable.Cell>

                      <DataTable.Cell>
                        <Text style={styles.cellText}>{item.cantidad}</Text>
                      </DataTable.Cell>

                      <DataTable.Cell>
                        <View style={styles.contenedorFila}>
                          <Image style={styles.logo} source={require('../img/no_correcto.png')}/>
                          <Image style={styles.logo} source={require('../img/controlar.png')}/>
                        </View>
                      </DataTable.Cell>

                  </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({

   contenedorFila: {
    flexDirection: 'row',     // Alinea los elementos de forma horizontal
    justifyContent: 'center', // Centra las imágenes horizontalmente (opcional)
    alignItems: 'center',     // Centra las imágenes verticalmente (opcional)
    gap: 50,                  // Agrega espacio de 10px entre cada imagen
    padding: 10,              // Espaciado interno del contenedor
  },

  container: { 
    flex: 1, 
    paddingTop: 5, 
    paddingHorizontal: 5,
    backgroundColor: '#fff' 
  },
  
/*container:{
    flex:1,
    backgroundColor:'#F5F7FB',
    padding:20
  }, */

  head: { 
    height: 44, 
    backgroundColor: 'lavender' 
  },
  
  row: { 
    height: 40, 
    backgroundColor: 'lightyellow' 
  },

  cellText: {
    fontSize: 13,
    color: '#333',
    flexWrap: 'wrap', 
  },

  logo: {
    width: 36,
    height: 48,
    resizeMode: "contain"
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

  name:{
    fontSize:16,
    fontWeight:'bold',
    color:'#111827'
  },

  headerText:{
    color:'#fff',
    fontWeight:'bold'
  },


  product:{
    backgroundColor:'#fff',
    marginTop:10,
    padding:18,
    gap: 50,
    borderRadius:12,
    flexDirection:'row',
    justifyContent:'space-between',
    elevation:2
    
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