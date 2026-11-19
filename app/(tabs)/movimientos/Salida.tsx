import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DataTable } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import CustomModal from '../../../componentes/botones/ScreenModal';
import BotonVolver from '../../../componentes/botones/boton_volver';
import { API_URL } from '../../../constants/api';
import { Producto } from '../../../types/Producto';
import { obtenerToken } from '../../../constants/auth';
import { useUsuarioActual } from '../../../hooks/useUsuarioActual';
import ModalConfirmacion from '../../../componentes/botones/modal_confirmacion';



export default function Salida() {
   const { id_pedido } = useLocalSearchParams<{ id_pedido: string }>();
    const [datos, setDatos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [nuevoConteo, setNuevoConteo] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [finalizado, setFinalizado] = useState(false);
    const {usuarioActual} = useUsuarioActual();
    const router = useRouter();
    const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
    



    // =========================================================================
    // MOSTRAR MENSAJES MULTIPLATAFORMA
    // =========================================================================
    const mostrarMensaje = (titulo: string, mensaje: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensaje}`);
        } else {
            Alert.alert(titulo, mensaje);
        }
    };



    
    // Cálculo dinámico de inconsistencias (ej: cuando lo despachado es diferente a lo solicitado)
    const totalInconsistencias = datos.filter(
        item => item.cantidad_despachada !== item.cantidad_solicitada
    ).length;

    const cargarProductosPedido = async () => {
      try {
          const respuesta = await fetch(`${API_URL}/api/pedidos/${id_pedido}/productos`);
          if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
  
          const resultado = await respuesta.json();
  
          const productosAdaptados: Producto[] = resultado.map((item: any) => ({
            id_detalle: item.id_detalle,
                id_producto: item.id_producto,
                codigo_sm: item.codigo_sm,
                nombre: item.nombre,
                id_marca: item.id_marca,
                referencia: item.referencia,
                descripcion: item.descripcion,
                precio: item.precio,
                cantidad_fisica: item.cantidad_fisica ?? 0,
                cantidad_despachada: item.cantidad_despachada ?? 0,
                cantidad_solicitada: item.cantidad_solicitada ?? 0,
        }));
  
          setDatos(productosAdaptados);
      } catch (error) {
          console.log("Error cargando productos del pedido:", error);
      }
    };




    const confirmarCancelacion  = async () => {
            try {
                const token = await obtenerToken();
    
                if (!token) {
                    throw new Error('No hay una sesión activa.');
                }
    
                const datos = {
                    id_pedido: Number(id_pedido),
                };
    
                const respuesta = await fetch(`${API_URL}/api/pedidos/cancelar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(datos),
                });
    
                const resultado = await respuesta.json().catch(() => null);
    
                if (!respuesta.ok) {
                    console.error('STATUS:', respuesta.status);
                    console.error('RESPUESTA BACKEND:', JSON.stringify(resultado, null, 2));
    
                    const detalle = resultado?.detail || resultado?.mensaje;
    
                    throw new Error(
                        typeof detalle === 'string'
                            ? detalle
                            : JSON.stringify(detalle ?? `Error HTTP: ${respuesta.status}`)
                    );
                }
    
                mostrarMensaje('cancelado', '');
                router.back();
            } catch (err) {
                console.error('Error cancelando:', err);
                mostrarMensaje(
                    'Error al cancelar',
                    err instanceof Error ? err.message : 'No fue posible cancelar el inventario.'
                );
            } finally {
                
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

          const pendiente = productoSeleccionado.cantidad_solicitada - productoSeleccionado.cantidad_despachada;
            
          if (cantidad > pendiente) {
              Alert.alert(
                  'Cantidad excedida',
                  `Solo faltan ${pendiente} unidades por Salir.`
              );
              return;
          }

          try {

                      const token = await obtenerToken();
                      const cantidad = Number(nuevoConteo);
                      const idDetalle = Number(productoSeleccionado.id_detalle);
              
                      const cuerpo = {
                          id_usuario: usuarioActual.id_usuario,
                          id_movimentos: 2,
                          id_detalle: idDetalle,
                          id_pedido: Number(id_pedido),
                          id_producto: productoSeleccionado.id_producto,
                          id_estado: 2,
                          id_inventario: null,
                          cantidad,
                          observacion: 'Salida de mercancía',
                      };
              
                      const respuesta = await fetch(
                          `${API_URL}/api/historial_movimientos/registrar`,
                          {
                              method: 'POST',
                              headers: {
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(cuerpo),
                          }
                      );
              
                      const datosRespuesta = await respuesta.json();



                      console.log('ESTADO HTTP:', respuesta.status);
                    console.log('RESPUESTA FASTAPI:', datosRespuesta);

                    if (!respuesta.ok) {
                        throw new Error(JSON.stringify(datosRespuesta));
                    }// Actualizar cantidades
                      setDatos(prev => {
                          console.log('DATOS ANTES DE ACTUALIZAR:', prev);
                          console.log('ID DETALLE BUSCADO:', idDetalle);

                          const nuevosDatos = prev.map(item => {
                              if (Number(item.id_detalle) === idDetalle) {
                                  console.log('PRODUCTO ACTUALIZADO:', item);

                                  return {
                                      ...item,
                                      cantidad_despachada:
                                          Number(item.cantidad_despachada || 0) + cantidad,
                                      cantidad_fisica:
                                          Number(item.cantidad_fisica || 0) + cantidad,
                                  };
                              }

                              return item;
                          });

                          console.log('NUEVOS DATOS:', nuevosDatos);

                          return nuevosDatos;
                      });

                      // Limpiar y cerrar modal
                      setProductoSeleccionado(null);
                      setNuevoConteo('');
                      setModalVisible(false);

                      // Mensaje según plataforma
                      if (Platform.OS === 'web') {
                          window.alert('Éxito: Salida registrada correctamente.');
                      } else {
                          Alert.alert('Éxito', 'Salida registrada correctamente.');
                      }

                  } catch (error) {
                      console.log('ERROR AL INGRESAR PRODUCTO:', error);

                      if (Platform.OS === 'web') {
                          window.alert('Error: No se pudo registrar la Salida.');
                      } else {
                          Alert.alert('Error', 'No se pudo registrar Salida.');
                      }
                  }
              };

    useEffect(() => {
        if (id_pedido) {
            cargarProductosPedido();
        }
    }, [id_pedido]);

  return (
<SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
              <BotonVolver />
                  {(Number(usuarioActual?.id_rol) === 1 || Number(usuarioActual?.id_rol) === 2)  && (
                    <>
                          <Pressable
                              style={styles.btnCancelar}
                              onPress={() => setModalCancelarVisible(true)}
                          >
                              <Text style={styles.textoCancelar}>Cancelar</Text>
                          </Pressable>
                      </>
                  )}
              <Text style={styles.title}>Entrega de mercancía</Text>
              <Text style={styles.subtitle}>
                Entrega de productos y existencias, por favor asegúrese de que la información sea correcta.
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Tarjetas de Métricas */}
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
                        <Text style={[styles.number, { color: totalInconsistencias > 0 ? '#DC2626' : '#16A34A' }]}>
                          {totalInconsistencias}
                        </Text>
                        <Text style={styles.label}>Inconsistencias</Text>
                    </View>
                </View>

                {/* Tabla */}
                <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title><Text style={styles.headerText}>Código</Text></DataTable.Title>
                      <DataTable.Title><Text style={styles.headerText}>Producto</Text></DataTable.Title>
                      <DataTable.Title numeric><Text style={styles.headerText}>Desp. / Solicitado</Text></DataTable.Title>
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
                    >
                      <DataTable.Row style={styles.productRow}>
                        <DataTable.Cell>
                          <Text style={styles.cellBold}>{item.codigo_sm}</Text>
                        </DataTable.Cell>

                        <DataTable.Cell>
                          <View>
                            <Text style={styles.name}>{item.nombre}</Text>
                            <Text style={styles.category}>{item.referencia}</Text>
                          </View>
                        </DataTable.Cell>

                        <DataTable.Cell numeric>
                          <Text style={[styles.stock, { color: item.cantidad_despachada >= item.cantidad_solicitada ? '#16A34A' : '#D97706' }]}>
                            {item.cantidad_despachada} / {item.cantidad_solicitada}
                          </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    </Pressable>
                  ))}
                </DataTable>
                <ModalConfirmacion
                    visible={modalCancelarVisible}
                    titulo="¿Cancelar operación?"
                    mensaje="¿Estás seguro de que quieres cancelar esta operación?"
                    textoConfirmar="Sí, cancelar"
                    textoCancelar="Volver"
                    onCancelar={() => setModalCancelarVisible(false)}
                    onConfirmar={confirmarCancelacion}
                />
                {/* Modal fuera del .map */}
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
    backgroundColor: '#F5F7FB',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 20,
    fontSize: 13,
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  number: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
  },
  btnCancelar: {
      backgroundColor: '#f2563bf3',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  textoCancelar: {
      color: '#FFF',
      fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  tableHeader: {
    backgroundColor: '#111827',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  category: {
    fontSize: 11,
    color: '#6B7280',
  },
  cellBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  stock: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});