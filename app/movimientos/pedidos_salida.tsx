
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

import BotonVolver from '../../componentes/botones/boton_volver';

interface Pedido {
  id_pedido: number;
  numero_pedido: number;
  cliente: string;
  id_entrada: number;
}

export default function PedidosEntrada() {
  const API_URL = "http://127.0.0.1:8000";
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
      pathname: "/movimientos/Salida",
      params: {
        id_pedido: String(pedido.id_pedido)
      }
    });
  };

  return (
    <View style={styles.container}>
      <BotonVolver />

      <Text style={styles.title}>Salida de entrada</Text>

      <Text style={styles.subtitle}>
        Selecciona un pedido para registrar la salida.
      </Text>

      <View style={styles.header}>
        <Text style={styles.headerText}>Pedido</Text>
        <Text style={styles.headerText}>Cliente</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : (
        <ScrollView>
          {pedidos.map((item) => (
            <Pressable
              key={item.id_pedido}
              style={styles.product}
              onPress={() => seleccionarPedido(item)}
            >
              <Text style={styles.cell}>
                {item.numero_pedido}
              </Text>

              <Text style={styles.cell}>
                {item.cliente}
              </Text>
            </Pressable>
          ))}

          {pedidos.length === 0 && (
            <Text style={styles.empty}>
              No hay pedidos de entrada disponibles.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 20
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827'
  },
  subtitle: {
    color: '#6B7280',
    marginVertical: 15
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 15,
    borderRadius: 10
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1
  },
  product: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    marginTop: 10,
    borderRadius: 12,
    elevation: 2
  },
  cell: {
    flex: 1,
    color: '#333',
    fontSize: 14
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280'
  }
});
