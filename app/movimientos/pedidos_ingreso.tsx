import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

import BotonVolver from '../../componentes/botones/boton_volver';
import { API_URL } from '../../constants/api';

interface Pedido {
  id_pedido: number;
  numero_pedido: number;
  cliente: string;
  id_entrada: number;
  id_estado: number;
}

export default function PedidosEntrada() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const crearPedido = () => {
    router.push('/pedidos/CrearPedido');
  };


  const cargarPedidos = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos/por-tipo?tipo=1`);
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      const datos = await respuesta.json();
      setPedidos(datos);
    } catch (error) {
      console.log("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const seleccionarPedido = (pedido: Pedido) => {
    router.push({
      pathname: "/movimientos/Ingreso",
      params: { id_pedido: String(pedido.id_pedido) }
    });
  };

  const obtenerEstado = (id_estado: number) => {
    switch (id_estado) {
      case 1: return 'Finalizado';
      case 2: return 'Pendiente';
      case 3: return 'En progreso';
      case 4: return 'En pausa';
      case 5: return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // Mapeo limpio para los estilos de insignias de estados
  const obtenerEstiloEstado = (id_estado: number) => {
    switch (id_estado) {
      case 1: return styles.finalizado;
      case 2: return styles.pendiente;
      case 3: return styles.progreso;
      case 4: return styles.pausa;
      case 5: return styles.cancelado;
      default: return styles.desconocido;
    }
  };

  return (
    <View style={styles.container}>
      <BotonVolver />

      <View style={styles.titleContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.botonCrear,
            pressed && { opacity: 0.8 }
          ]}
          onPress={crearPedido}
        >
          <Text style={styles.botonCrearTexto}>＋ Crear pedido</Text>
        </Pressable>
        <Text style={styles.title}>Pedidos de entrada</Text>
        <Text style={styles.subtitle}>
          Selecciona un pedido para gestionar el ingreso de mercancía de forma rápida.
        </Text>
      </View>

      <View style={styles.tableContainer}>
        {/* Cabecera limpia y estilizada */}
        <View style={styles.header}>
          <Text style={[styles.headerText, styles.colPedido]}>Nº Pedido</Text>
          <Text style={[styles.headerText, styles.colCliente]}>Cliente</Text>
          <Text style={[styles.headerText, styles.colEstado, { textAlign: 'center' }]}>Estado</Text>
        </View>

        {cargando ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#c48703" />
            <Text style={styles.loadingText}>Sincronizando información...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            {pedidos.map((item) => (
              <Pressable
                key={item.id_pedido}
                style={({ pressed }) => [
                  styles.product,
                  pressed && styles.productPressed
                ]}
                onPress={() => seleccionarPedido(item)}
              >
                <Text style={[styles.cellPedido, styles.colPedido]}>
                  #{item.numero_pedido}
                </Text>

                <Text style={[styles.cellCliente, styles.colCliente]} numberOfLines={2}>
                  {item.cliente}
                </Text>

                <View style={[styles.colEstado, styles.estadoContainer]}>
                  <Text style={[styles.estadoBase, obtenerEstiloEstado(item.id_estado)]}>
                    {obtenerEstado(item.id_estado)}
                  </Text>
                </View>
              </Pressable>
            ))}

            {pedidos.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.empty}>No hay pedidos de entrada listados por el momento.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fondo gris claro sutil (Slate 50) para que resalte la tabla
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A', // Slate 900 (Contraste premium)
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B', // Slate 500
    marginTop: 6,
    lineHeight: 20,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Borde suave Slate 200
    // Sombras ligeras y elegantes
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Cabecera oscura Slate 900 para una presencia sofisticada
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colPedido: {
    flex: 0.9,
  },
  colCliente: {
    flex: 1.6,
    paddingRight: 8,
  },
  colEstado: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productPressed: {
    backgroundColor: '#F8FAFC',
  },
  cellPedido: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700', // El número de pedido destaca más
  },
  cellCliente: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  estadoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCrear: {
  backgroundColor: '#C48703',
  paddingVertical: 13,
  paddingHorizontal: 18,
  borderRadius: 10,
  alignSelf: 'flex-end',
  marginBottom: 16,
},

botonCrearTexto: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},
  estadoBase: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6, // Esquinas semirredondeadas más profesionales estilo web/dashboard
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 85,
  },
  // Paletas de estados modernizadas (Colores menos saturados y más corporativos)
  finalizado: {
    color: '#166534',
    backgroundColor: '#DCFCE7',
  },
  pendiente: {
    color: '#9A3412',
    backgroundColor: '#FFEDD5',
  },
  progreso: {
    color: '#1E40AF',
    backgroundColor: '#DBEAFE',
  },
  pausa: {
    color: '#5B21B6',
    backgroundColor: '#EDE9FE',
  },
  cancelado: {
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
  },
  desconocido: {
    color: '#334155',
    backgroundColor: '#E2E8F0',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  empty: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
