import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { DataTable } from 'react-native-paper';



import BotonInicio from '../../componentes/botones/boton_inicio';
import CustomModal from '../../componentes/botones/ScreenModal';
import BotonVolver from '../../componentes/botones/boton_volver';
import { API_URL } from '../../constants/api';



interface Producto { 
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_marca: number;
    referencia: string;
    descripcion: string;
    precio: number;
    cantidad_fisica: number;
    cantidad_despachada: number;
    cantidad_solicitada: number;
    id_detalle: number;
}




export default function Salida(){
   
      const { id_pedido } = useLocalSearchParams<{ id_pedido: string }>();
      const [datos, setDatos] = useState<Producto[]>([]);
      const [finalizado, setFinalizado] = useState(false);
      const [nuevoConteo, setNuevoConteo] = useState('');
      const [modalVisible, setModalVisible] = useState(false);
      const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);



      const cargarProductosPedido = async () => {
          try {
              const respuesta = await fetch(`${API_URL}/api/pedidos/${id_pedido}/productos`);
              if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
                  const resultado = await respuesta.json();
                  const productosAdaptados = resultado.map((item: any) => ({
                      id_producto: item.id_producto,
                      codigo_sm: item.codigo_sm,
                      id_marca: item.id_marca,
                      referencia: item.referencia,
                      precio: item.precio,
                      descripcion: item.descripcion,
                      id_detalle: item.id_detalle,
                      nombre: item.nombre,
                      cantidad_solicitada: item.cantidad_solicitada,
                      cantidad_despachada: item.cantidad_despachada ?? 0,
                      cantidad_fisica: item.cantidad_fisica ?? 0,
          }));      
          setDatos(productosAdaptados);
          } catch (error) {
              console.log("Error cargando productos del pedido:", error);
          }
      };




      const SalidaProducto = async () => {

          if (!productoSeleccionado) {
              Alert.alert('Atención', 'Selecciona un producto.');
              return;
          }

          if (
              nuevoConteo.trim() === '' ||
              !/^\d+$/.test(nuevoConteo.trim()) ||
              Number(nuevoConteo) <= 0
          ) {
              Alert.alert('Atención', 'Ingresa una cantidad entera mayor que cero.');
              return;
          }

          const cantidad = Number(nuevoConteo);

          // Validar inventario disponible
          if (cantidad > productoSeleccionado.cantidad_fisica) {
              Alert.alert(
                  'Stock insuficiente',
                  `Solo existen ${productoSeleccionado.cantidad_fisica} unidades disponibles.`
              );
              return;
          }

          // Validar cantidad pendiente del pedido
          const pendiente =
              productoSeleccionado.cantidad_solicitada -
              productoSeleccionado.cantidad_despachada;

          if (cantidad > pendiente) {
              Alert.alert(
                  'Cantidad excedida',
                  `Solo faltan ${pendiente} unidades por despachar.`
              );
              return;
          }

          try {

              const respuesta = await fetch(
                  `${API_URL}/api/historial_movimientos/registrar`,
                  {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          id_usuario: 1,
                          id_movimentos: 2,
                          id_pedido: Number(id_pedido),
                          id_producto: productoSeleccionado.id_producto,
                          cantidad: cantidad,
                          observacion: 'Salida de mercancía'
                      })
                  }
              );

              const datosRespuesta = await respuesta.json();

              if (!respuesta.ok) {
                  throw new Error(datosRespuesta.detail || 'Error al registrar la salida.');
              }

              // Actualizar cantidades localmente
              setDatos(prev =>
                  prev.map(item =>
                      item.id_detalle === productoSeleccionado.id_detalle
                          ? {
                              ...item,
                              cantidad_fisica: item.cantidad_fisica - cantidad,
                              cantidad_despachada: item.cantidad_despachada + cantidad
                          }
                          : item
                  )
              );

              setProductoSeleccionado(null);
              setNuevoConteo('');
              setModalVisible(false);

              Alert.alert('Éxito', 'Salida de mercancía registrada correctamente.');

          } catch (error) {

              console.log('Error al registrar salida:', error);

              Alert.alert(
                  'Error',
                  error instanceof Error ? error.message : 'Error de conexión.'
              );
          }
      };




      const finalizarRecepcion = () => {
          Alert.alert(
              'Confirmar',
              '¿Estás seguro de finalizar este pedido?',
              [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                      text: 'Sí, finalizar', 
                      onPress: async () => {
                          try {
                              const respuesta = await fetch(`${API_URL}/api/pedidos/${id_pedido}/finalizar`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' }
                              });
                              const resultado = await respuesta.json();
                
                              if (!respuesta.ok) throw new Error(resultado.detail || 'Error al finalizar.');
                              
                              
                              setFinalizado(true);
                              setModalVisible(false);
                              Alert.alert('Éxito', 'Pedido finalizado correctamente.');
                          } catch (error) {
                              Alert.alert('Error', error instanceof Error ? error.message : 'Error de conexión.');
                          }
                      }
                  }
              ]
          );
      }; 
              



      const consultarEstadoPedido = async () => {
          try {
              const respuesta = await fetch(`${API_URL}/api/pedidos/${id_pedido}/estado`);
              if (!respuesta.ok) throw new Error('No se pudo consultar el estado.');
              
              const resultado = await respuesta.json();
              setFinalizado(resultado.id_estado === 1 || resultado.id_estado === 5);
          } catch (error) {
              console.log('Error consultando estado:', error);
          }
      };



      useEffect(() => {
          if (id_pedido) {
              cargarProductosPedido();
              consultarEstadoPedido();
          }
      }, [id_pedido]);
                



  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                  <BotonVolver />

                  <Text style={styles.title}>Salida de mercancía</Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  <Text style={styles.subtitle}>
                    salida de productos y existencias, por favor asegúrese de que la información sea correcta antes de proceder con la entrega de mercancía. y que el producto se encuentre en buen estado y cumpla con los estándares de calidad requeridos.
                  </Text>

                    {/* Tarjetas informativas estáticas / métricas */}
                  <View style={styles.cards}>
                      <View style={styles.card}>
                          <Text style={styles.number}>{datos.length}</Text>
                          <Text style={styles.label}>Productos</Text>
                      </View>
                      <View style={styles.card}>
                          <Text style={styles.number}>5</Text>
                          <Text style={styles.label}>Categorías</Text>
                      </View>
                      <View style={styles.card}>
                          <Text style={[styles.number, { color: '#DC2626' }]}>2</Text>
                          <Text style={styles.label}>Inconsistencias</Text>
                          </View>
                  </View>



                  {/* Tabla de Productos */}
                  <View style={styles.tableContainer}>
                      <DataTable>
                          <DataTable.Header style={styles.tableHeader}>
                              <DataTable.Title key="codigo">
                                  <Text style={styles.headerText}>Código</Text>
                              </DataTable.Title>

                              <DataTable.Title key="producto">
                                  <Text style={styles.headerText}>Producto</Text>
                              </DataTable.Title>

                              <DataTable.Title key="cantidad" numeric>
                                  <Text style={styles.headerText}>Despachado / Solicitado</Text>
                              </DataTable.Title>
                          </DataTable.Header>


            
                          {datos.map((item) => (
                              <Pressable
                                  key={item.id_detalle}
                                  onPress={() => {
                                      setProductoSeleccionado(item);
                                      setModalVisible(true);
                                      setNuevoConteo('');
                                  }}
                                  disabled={finalizado}
                                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                              >
                                  <DataTable.Row style={styles.productRow}>
                                      <DataTable.Cell>
                                          <View style={styles.contenedorColumna}>
                                              <Text style={styles.cellBold}>{item.codigo_sm}</Text>
                                              <Text style={styles.cellSubtext}>{item.descripcion}</Text>
                                          </View>
                                      </DataTable.Cell>
                              
                                      <DataTable.Cell>
                                          <Text style={styles.cellText}>{item.nombre}</Text>
                                      </DataTable.Cell>
                              
                                      <DataTable.Cell numeric>
                                          <Text style={[styles.cellText, { fontWeight: 'bold', color: item.cantidad_despachada >= item.cantidad_solicitada ? '#16A34A' : '#D97706' }]}>
                                              {item.cantidad_despachada} / {item.cantidad_solicitada}
                                          </Text>
                                      </DataTable.Cell>
                                  </DataTable.Row>
                              </Pressable>
                          ))}
                      </DataTable>
                  </View>

                  <CustomModal
                      modalVisible={modalVisible}
                      setModalVisible={setModalVisible}
                      productoSeleccionado={productoSeleccionado}
                      nuevoConteo={nuevoConteo}
                      setNuevoConteo={setNuevoConteo}
                      ingresarProducto={SalidaProducto}
                      finalizado={finalizado}
                  />
              </ScrollView>


                  <Pressable
                        onPress={finalizarRecepcion}
                        disabled={finalizado}
                        style={[styles.botonFinalizar, finalizado && styles.botonFinalizarDisabled]}
                    >
                        <Text style={styles.textoBotonFinalizar}>
                            {finalizado ? 'Pedido Cerrado / Finalizado' : 'Finalizar Salida'}
                        </Text>
                    </Pressable>

            
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  pedidoBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 18,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tableHeader: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 6,
  },
  contenedorColumna: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cellBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  cellSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cellText: {
    fontSize: 13,
    color: '#374151',
  },
  botonFinalizar: {
    backgroundColor: '#198754',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  botonFinalizarDisabled: {
    backgroundColor: '#9CA3AF',
  },
  textoBotonFinalizar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});