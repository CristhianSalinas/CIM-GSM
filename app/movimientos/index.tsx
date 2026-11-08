import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { useRouter } from 'expo-router';
import BotonInicio from '../../componentes/botones/boton_inicio';

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const esWeb = Platform.OS === 'web';
  const pantallaGrande = width >= 768;

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        style={[
          styles.container,
          esWeb && styles.containerWeb,
        ]}
      >
        <BotonInicio />

        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Control de mercancía</Text>
          <Text style={styles.subtitulo}>
            Gestiona los ingresos y salidas de productos del inventario.
          </Text>
        </View>

        {/* TARJETAS */}
        <View
          style={[
            styles.contenedor,
            pantallaGrande && styles.contenedorWeb,
          ]}
        >
          {/* INGRESOS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardIngreso,
              pantallaGrande && styles.cardWeb,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/movimientos/pedidos_ingreso')}
          >
            <View style={styles.iconoContainer}>
              <Text style={styles.icono}>↓</Text>
            </View>

            <Text style={styles.cardTitulo}>Ingreso de mercancía</Text>

            <Text style={styles.cardDescripcion}>
              Registra los productos que ingresan a la bodega y actualiza
              las existencias del inventario.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardAccion}>Registrar ingreso</Text>
              <Text style={styles.flecha}>→</Text>
            </View>
          </Pressable>

          {/* SALIDAS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.cardSalida,
              pantallaGrande && styles.cardWeb,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push('/movimientos/pedidos_salida')}
          >
            <View style={styles.iconoContainer}>
              <Text style={styles.icono}>↑</Text>
            </View>

            <Text style={styles.cardTitulo}>Salida de mercancía</Text>

            <Text style={styles.cardDescripcion}>
              Gestiona los despachos de productos y controla las cantidades
              que salen de la bodega.
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardAccion}>Registrar salida</Text>
              <Text style={styles.flecha}>→</Text>
            </View>
          </Pressable>
        </View>

        {/* PIE DE PÁGINA */}
        <Text style={styles.footer}>
          CIM · Control de Inventarios y Movimientos
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },

  scrollContent: {
    flexGrow: 1,
    padding: 18,
  },

  container: {
    width: '100%',
    gap: 22,
  },

  containerWeb: {
    maxWidth: 1100,
    alignSelf: 'center',
    paddingTop: 10,
  },

  header: {
    marginTop: 10,
    marginBottom: 8,
  },

  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#172B4D',
  },

  subtitulo: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 22,
  },

  contenedor: {
    flexDirection: 'column',
    gap: 18,
  },

  contenedorWeb: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    minHeight: 230,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    gap: 14,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0px 3px 12px rgba(15, 23, 42, 0.06)',
      } as any,
      default: {
        elevation: 2,
      },
    }),
  },

  cardWeb: {
    flex: 1,
    minHeight: 260,
  },

  cardIngreso: {
    borderTopWidth: 5,
    borderTopColor: '#16845B',
  },

  cardSalida: {
    borderTopWidth: 5,
    borderTopColor: '#2563EB',
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  iconoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icono: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  cardTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172B4D',
  },

  cardDescripcion: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
  },

  cardAccion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },

  flecha: {
    fontSize: 22,
    color: '#2563EB',
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 15,
  },
});
