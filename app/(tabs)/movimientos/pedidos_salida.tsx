import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

import BotonVolver from '../../../componentes/botones/boton_volver';
import { API_URL } from '../../../constants/api';

interface Pedido {
  id_pedido: number;
  numero_pedido: number;
  cliente: string;
  id_entrada: number;
}

export default function PedidosSalida() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarPedidos = async () => {
    try {
      const respuesta = await fetch(
        `${API_URL}/api/pedidos/por-tipo?tipo=2`
      );

      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      setPedidos(datos);

    } catch (error) {
      console.log('Error al cargar pedidos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // Abrir pantalla para crear salida
  const crearSalida = () => {
    router.push('/pedidos/CrearSalida');
  };

  // Seleccionar salida
  const seleccionarPedido = (pedido: Pedido) => {
    router.push({
      pathname: '/movimientos/Salida',
      params: {
        id_pedido: String(pedido.id_pedido)
      }
    });
  };

  return (
    <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

              <BotonVolver />

              <View style={styles.titleContainer}>

                <Text style={styles.title}>
                  Salidas de mercancía
                </Text>

                <Text style={styles.subtitle}>
                  Selecciona una salida para gestionar el despacho de mercancía.
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.botonCrear,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }
                  ]}
                  onPress={crearSalida}
                >
                  <Text style={styles.botonCrearTexto}>
                    ＋ Crear salida
                  </Text>
                </Pressable>

              </View>

              <View style={styles.header}>
                <Text style={styles.headerText}>PEDIDO</Text>
                <Text style={[styles.headerText, styles.headerTextRight]}>CLIENTE</Text>
              </View>

              {cargando ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                  {pedidos.map((item) => (
                    <Pressable
                      key={item.id_pedido}
                      style={({ pressed }) => [
                        styles.product,
                        pressed && styles.productPressed
                      ]}
                      onPress={() => seleccionarPedido(item)}
                    >
                      <View style={styles.cellPedidoContainer}>
                        <Text style={styles.cellPedidoLabel}>Nº</Text>
                        <Text style={styles.cellPedido}>
                          {item.numero_pedido}
                        </Text>
                      </View>

                      <Text style={styles.cellCliente} numberOfLines={1}>
                        {item.cliente}
                      </Text>
                    </Pressable>
                  ))}

                  {pedidos.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.empty}>
                        No hay salidas disponibles.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
          </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  titleContainer: {
    marginBottom: 20,
    marginTop: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },

  botonCrear: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  botonCrearTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },

  headerText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.8,
    flex: 1,
  },

  headerTextRight: {
    textAlign: 'left',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  product: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  productPressed: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },

  cellPedidoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cellPedidoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginRight: 4,
  },

  cellPedido: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  cellCliente: {
    flex: 1.5,
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});