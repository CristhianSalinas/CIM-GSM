import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { DataTable } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import CustomModal from '../../../componentes/botones/ScreenModal';
import BotonVolver from '../../../componentes/botones/boton_volver';
import { API_URL } from '../../../constants/api';
import { Producto } from '../../../types/Producto';


export default function Salida() {
   const { id_pedido } = useLocalSearchParams<{ id_pedido: string }>();
  
    const [datos, setDatos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [nuevoConteo, setNuevoConteo] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [finalizado, setFinalizado] = useState(false);

    
    
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

              const respuesta = await fetch(
                  `${API_URL}/api/historial_movimientos/salida`,
                  {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          id_usuario: 1,
                          id_movimentos: 2,
                          id_pedido: Number(id_pedido),
                          id_producto: productoSeleccionado.id_producto,
                          cantidad: cantidad,
                          observacion: 'Salida de mercancía',
                          id_detalle: productoSeleccionado.id_detalle
                      })
                  }
              );


          const resultado = await respuesta.json();

            console.log("ESTADO:", respuesta.status);
            console.log("ERROR FASTAPI:", resultado);

              if (!respuesta.ok) throw new Error(resultado.detail || 'Error al registrar la salida.');

              setDatos(prev =>
                  prev.map(item =>
                      item.id_detalle === productoSeleccionado.id_detalle
                          ? {
                              ...item,
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
              Alert.alert('Error', error instanceof Error ? error.message : 'Error de conexión.');
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