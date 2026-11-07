import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';

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

interface Estadisticas {
  total_productos: number;
  Stock_Bajo: number;
  Agotados: number;
}

export default function Conteo(){
  
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
    

    const [busqueda, setBusqueda] = useState('');


    const [estadisticas, setEstadisticas] = useState<Estadisticas>({
        total_productos: 0,
        Stock_Bajo: 0,
        Agotados: 0
    });
    

    const cargarEstadisticas = async () => {
        try {
            const respuesta = await fetch(
                `${API_URL}/api/productos/estadisticas`
            );
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            const datos = await respuesta.json();
            setEstadisticas(datos);
        } catch (error) {
            console.log("Error al cargar estadísticas:", error);
        }
    };

    const enviarInventario = async () => {
        if (!productoSeleccionado) {
            alert('Selecciona un producto.');
            return;
        }

        if (
            nuevoConteo.trim() === '' ||
            !Number.isInteger(Number(nuevoConteo)) ||
            Number(nuevoConteo) < 0
        ) {
            alert('Ingresa una cantidad válida.');
            return;
        }
        try {
            const respuesta = await fetch(
                `${API_URL}/api/inventarios/enviar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_usuario: 1,
                        id_ubicacion: 1,
                        id_producto: productoSeleccionado?.id_producto,
                        cantidad_contada: Number(nuevoConteo),
                        observacion: 'Conteo físico'
                    })
                }
            );

                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    throw new Error(JSON.stringify(error));
                }

                const datos = await respuesta.json();

                console.log('Inventario registrado:', datos);

                await cargarProductos();
                await cargarEstadisticas();

                setProductoSeleccionado(null);
                alert('Inventario registrado correctamente.');

        } catch (error) {
            console.log('Error al registrar inventario:', error);
            alert('No se pudo registrar el inventario.');
        }
    };

    const [productoSeleccionado, setProductoSeleccionado] =
        useState<Producto | null>(null);


    const [nuevoConteo, setNuevoConteo] = useState('');


    const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'agotados'>('todos');

    const productosFiltrados = productos.filter((producto) => {
        const texto = busqueda.toLowerCase().trim();

        const coincideBusqueda =
          producto.nombre.toLowerCase().includes(texto) ||
          producto.codigo_sm.toLowerCase().includes(texto) ||
          (producto.referencia || '').toLowerCase().includes(texto);

        const coincideStock =
          filtroStock === 'todos' ||
          (filtroStock === 'bajo' && producto.cantidad_fisica > 0 && producto.cantidad_fisica <= 3) ||
          (filtroStock === 'agotados' && producto.cantidad_fisica <= 0);

        return coincideBusqueda && coincideStock;
    });


    useEffect(() => {
        cargarProductos();
        cargarEstadisticas();
    }, []);

    return (
        <View style={styles.container}>

            <BotonInicio />

            <Text style={styles.title}>Conteo Físico</Text>

              <Text style={styles.subtitle}>
                  Ajuste y Control de productos y existencias
              </Text>

              <TextInput
                  style={styles.busqueda}
                  placeholder="Buscar producto por nombre, código o referencia..."
                  value={busqueda}
                  onChangeText={setBusqueda}
              />

              <ScrollView>
                  <View>
                      <Text style={styles.subtitle}>
                        Selecciona una categoria para iniciar con el conteo físico de productos y verificar su stock.
                      </Text>

                      <View style={styles.cards}>

                          <View style={styles.card}>
                            <Text style={styles.number}>{estadisticas.total_productos}</Text>
                            <Text style={styles.label}>Productos</Text>
                          </View>

                          <TouchableOpacity
                              style={[
                                  styles.card,
                                  filtroStock === 'bajo' && styles.cardActiva
                              ]}
                              onPress={() =>
                                  setFiltroStock(filtroStock === 'bajo' ? 'todos' : 'bajo')
                              }
                              >
                              <Text style={styles.number}>
                                  {estadisticas.Stock_Bajo}
                              </Text>
                              <Text style={styles.label}>Stock bajo</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                              style={[
                                  styles.card,
                                  filtroStock === 'agotados' && styles.cardActiva
                              ]}
                              onPress={() =>
                                  setFiltroStock(filtroStock === 'agotados' ? 'todos' : 'agotados')
                              }
                              >
                              <Text style={styles.number}>
                                  {estadisticas.Agotados}
                              </Text>
                              <Text style={styles.label}>Agotados</Text>
                          </TouchableOpacity>

                      </View>


                      <View style={styles.tableHeader}>
                          <Text style={styles.headerText}>Producto</Text>
                          <Text style={styles.headerText}>Stock</Text>
                      </View>

                      {productosFiltrados.map((item) => (
                          <TouchableOpacity
                              key={item.id_producto}
                              style={styles.product}
                              onPress={() => {
                                  setProductoSeleccionado(item);
                                  setNuevoConteo(String(item.cantidad_fisica ?? 0));
                              }}
                          >

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

                                  {/*<Text style={
                                      item.estado === 'Disponible'
                                      ? styles.available
                                      : styles.warning
                                    }>
                                      {item.estado}
                                    </Text>*/}
                              </View>

                          </TouchableOpacity>
                      ))}

                      {productosFiltrados.length === 0 && (
                          <Text style={styles.sinResultados}>
                              No se encontraron productos.
                          </Text>
                      )}
                  </View>
              </ScrollView>
              <Modal
                  visible={productoSeleccionado !== null}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setProductoSeleccionado(null)}
              >
                  <View style={styles.modalFondo}>
                      <View style={styles.modalContenido}>

                          <Text style={styles.modalTitulo}>
                              Conteo físico
                          </Text>

                          <Text style={styles.modalNombre}>
                              {productoSeleccionado?.nombre}
                          </Text>

                          <Text style={styles.category}>
                              Código: {productoSeleccionado?.codigo_sm}
                          </Text>

                          <Text style={styles.label}>
                              Existencias registradas
                          </Text>

                          <Text style={styles.stock}>
                              {productoSeleccionado?.cantidad_fisica}
                          </Text>

                          <Text style={styles.label}>
                              Nueva cantidad contada
                          </Text>

                          <TextInput
                              style={styles.busqueda}
                              value={nuevoConteo}
                              onChangeText={setNuevoConteo}
                              keyboardType="numeric"
                              placeholder="Ingresa la cantidad encontrada"
                          />

                          <TouchableOpacity
                              style={styles.botonGuardar}
                              onPress={enviarInventario}
                          >
                              <Text style={styles.textoBoton}>
                                  Guardar conteo
                              </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                              style={styles.botonCancelar}
                              onPress={() => setProductoSeleccionado(null)}
                          >
                              <Text style={styles.textoCancelar}>
                                  Cancelar
                              </Text>
                          </TouchableOpacity>

                      </View>
                  </View>
              </Modal>          

        </View>
    );
  }


const styles = StyleSheet.create({

  container:{
      flex:1,
      backgroundColor:'#F5F7FB',
      padding:20
  },

  cardActiva: {
      borderWidth: 2,
      borderColor: '#2563EB',
      backgroundColor: '#EFF6FF'
  },

  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  modalContenido: {
      backgroundColor: '#FFFFFF',
      width: '100%',
      padding: 25,
      borderRadius: 18
  },

  modalTitulo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 15
  },

  modalNombre: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#111827'
  },

  botonGuardar: {
      backgroundColor: '#2563EB',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10
  },

  textoBoton: {
      color: '#FFFFFF',
      fontWeight: 'bold'
  },

  botonCancelar: {
      padding: 12,
      alignItems: 'center'
  },

  textoCancelar: {
      color: '#6B7280',
      fontWeight: 'bold'
  },

  busqueda: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 20,
      fontSize: 15,
      color: '#111827'
  },

  sinResultados: {
      textAlign: 'center',
      color: '#6B7280',
      marginTop: 25,
      fontSize: 15
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