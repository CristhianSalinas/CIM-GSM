import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import BotonVolver from '../../../componentes/botones/boton_volver';
import { useUsuarioActual } from '../../../hooks/useUsuarioActual';
import { API_URL } from '../../../constants/api';


interface Pedido {
    id_pedido: number;
    numero_pedido: number;
    cliente: string;
    id_entrada: number;
    id_estado: number;
    id_detalle: number;
}

export default function PedidosSalida() {
    const router = useRouter();

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);


    const { usuarioActual } = useUsuarioActual();

    const cargarPedidos = useCallback(async () => {
        try {
            const respuesta = await fetch(`${API_URL}/api/pedidos/por-tipo?tipo=2`);

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const datos = await respuesta.json();
            setPedidos(datos);
        } catch (error) {
            console.log('Error al cargar pedidos:', error);
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, []);

    useEffect(() => {
        cargarPedidos();
    }, [cargarPedidos]);

    const actualizar = () => {
        setActualizando(true);
        cargarPedidos();
    };

    // Abrir pantalla para crear salida
    const crearSalida = () => {
        router.push({
            pathname: '/pedidos/CrearPedido',
            params: { tipo: '2' },
        });
    };

    // Seleccionar salida
    const seleccionarPedido = (pedido: Pedido) => {
        router.push({
            pathname: '/movimientos/Salida',
            params: {
                id_pedido: String(pedido.id_pedido),
            },
        });
    };

    // CONFIGURACIÓN VISUAL DE ESTADOS (Idéntica a PedidosEntrada)
    const obtenerConfigEstado = (id_estado: number) => {
        switch (id_estado) {
            case 1:
                return {
                    label: 'FINALIZADO',
                    color: '#15803D',
                    bg: '#DCFCE7',
                    border: '#BBF7D0',
                };
            case 2:
                return {
                    label: 'PENDIENTE',
                    color: '#B45309',
                    bg: '#FEF3C7',
                    border: '#FDE68A',
                };
            case 3:
                return {
                    label: 'EN PROGRESO',
                    color: '#1D4ED8',
                    bg: '#DBEAFE',
                    border: '#BFDBFE',
                };
            case 4:
                return {
                    label: 'EN PAUSA',
                    color: '#6D28D9',
                    bg: '#EDE9FE',
                    border: '#DDD6FE',
                };
            case 5:
                return {
                    label: 'CANCELADO',
                    color: '#B91C1C',
                    bg: '#FEE2E2',
                    border: '#FECACA',
                };
            default:
                return {
                    label: 'DESCONOCIDO',
                    color: '#475569',
                    bg: '#F1F5F9',
                    border: '#E2E8F0',
                };
        }
    };

    if (cargando) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.textoCarga}>Cargando salidas de mercancía...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contenedor}>
                    
                    {(Number(usuarioActual?.id_rol) === 1 || Number(usuarioActual?.id_rol) === 2)  && (
                            <>
                    
                        {/* BARRA SUPERIOR: VOLVER + ACCIÓN PRINCIPAL */}
                        <View style={styles.topBar}>
                            <BotonVolver />

                            <Pressable
                                style={({ pressed }) => [
                                    styles.botonCrear,
                                    pressed && { opacity: 0.85 },
                                ]}
                                onPress={crearSalida}
                            >
                                <Text style={styles.botonCrearTexto}>+ Crear salida</Text>
                            </Pressable>
                        </View>
                      </>
                    )} 

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={styles.titulo}>Salidas de mercancía</Text>
                            <View style={[styles.badgeTipo, styles.badgeSalida]}>
                                <Text style={[styles.textoBadgeTipo, { color: '#B91C1C' }]}>
                                    SALIDA
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.subtitulo}>
                            Selecciona una salida para gestionar el despacho de mercancía.
                        </Text>
                    </View>

                    {/* BARRA DE RESUMEN */}
                    <View style={styles.resumen}>
                        <Text style={styles.textoResumen}>
                            Mostrando{' '}
                            <Text style={styles.numeroResumen}>{pedidos.length}</Text>{' '}
                            {pedidos.length === 1 ? 'salida' : 'salidas'}
                        </Text>

                        <Pressable
                            onPress={actualizar}
                            style={({ pressed }) => [
                                styles.botonActualizarWrapper,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Text style={styles.botonActualizar}>Actualizar ↻</Text>
                        </Pressable>
                    </View>

                    {/* TABLA */}
                    <View style={styles.tablaContenedor}>
                        {/* ENCABEZADO */}
                        <View style={[styles.fila, styles.encabezado]}>
                            <Text style={[styles.celda, styles.colPedido, styles.textoEncabezado]}>
                                N° PEDIDO
                            </Text>
                            <Text style={[styles.celda, styles.colCliente, styles.textoEncabezado]}>
                                CLIENTE
                            </Text>
                            <Text
                                style={[
                                    styles.celda,
                                    styles.colEstado,
                                    styles.textoEncabezado,
                                    styles.sinBordeDerecho,
                                    { textAlign: 'center' },
                                ]}
                            >
                                ESTADO
                            </Text>
                        </View>

                        {/* FILAS */}
                        <ScrollView
                            showsVerticalScrollIndicator
                            contentContainerStyle={styles.scrollLista}
                            refreshControl={
                                <RefreshControl
                                    refreshing={actualizando}
                                    onRefresh={actualizar}
                                    colors={['#1D4ED8']}
                                    tintColor="#1D4ED8"
                                />
                            }
                        >
                            {pedidos.map((item, index) => {
                                const estado = obtenerConfigEstado(item.id_estado);
                                const esPar = index % 2 === 0;

                                return (
                                    <Pressable
                                        key={item.id_pedido}
                                        style={({ pressed }) => [
                                            styles.fila,
                                            esPar ? styles.filaPar : styles.filaImpar,
                                            pressed && styles.filaPresionada,
                                        ]}
                                        onPress={() => seleccionarPedido(item)}
                                    >
                                        <View style={[styles.celda, styles.colPedido, styles.celdaInicio]}>
                                            <View style={styles.pillPedido}>
                                                <Text style={styles.textoPedido}>
                                                    #{item.numero_pedido}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text
                                            style={[
                                                styles.celda,
                                                styles.colCliente,
                                                styles.textoPrincipal,
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {item.cliente}
                                        </Text>

                                        <View
                                            style={[
                                                styles.celda,
                                                styles.colEstado,
                                                styles.celdaCentrada,
                                                styles.sinBordeDerecho,
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.badgeEstado,
                                                    {
                                                        backgroundColor: estado.bg,
                                                        borderColor: estado.border,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.textoEstado,
                                                        { color: estado.color },
                                                    ]}
                                                >
                                                    {estado.label}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}

                            {pedidos.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.sinDatosTitulo}>Sin salidas disponibles</Text>
                                    <Text style={styles.sinDatos}>
                                        No hay salidas registradas por el momento. Usa "+ Crear salida" para iniciar una.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    contenedor: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F8FAFC',
        padding: 16,
    },

    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },

    textoCarga: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 13,
        fontWeight: '500',
    },

    // BARRA SUPERIOR
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    botonCrear: {
        backgroundColor: '#1E293B',
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    botonCrearTexto: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // HEADER
    header: {
        marginBottom: 14,
    },

    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    titulo: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },

    subtitulo: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 3,
    },

    badgeTipo: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },

    badgeSalida: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA',
    },

    textoBadgeTipo: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // BARRA DE RESUMEN
    resumen: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    textoResumen: {
        fontSize: 12,
        color: '#64748B',
    },

    numeroResumen: {
        fontWeight: '700',
        color: '#0F172A',
    },

    botonActualizarWrapper: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },

    botonActualizar: {
        fontSize: 12,
        color: '#1D4ED8',
        fontWeight: '600',
    },

    // TABLA
    tablaContenedor: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    scrollLista: {
        flexGrow: 1,
    },

    fila: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        minHeight: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    filaPar: {
        backgroundColor: '#FFFFFF',
    },

    filaImpar: {
        backgroundColor: '#F8FAFC',
    },

    filaPresionada: {
        backgroundColor: '#EFF6FF',
    },

    encabezado: {
        minHeight: 40,
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
    },

    celda: {
        fontSize: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
    },

    celdaInicio: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    celdaCentrada: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    sinBordeDerecho: {
        borderRightWidth: 0,
    },

    textoEncabezado: {
        fontWeight: '700',
        color: '#475569',
        fontSize: 11,
        letterSpacing: 0.4,
    },

    textoPrincipal: {
        color: '#0F172A',
        fontWeight: '500',
        fontSize: 13,
    },

    // COLUMNAS RESPONSIVAS AL 100%
    colPedido: {
        flex: 1,
        minWidth: 100,
    },

    colCliente: {
        flex: 2.5,
        minWidth: 160,
    },

    colEstado: {
        flex: 1.2,
        minWidth: 125,
    },

    // PILLS Y BADGES
    pillPedido: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    textoPedido: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    badgeEstado: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        minWidth: 96,
        alignItems: 'center',
    },

    textoEstado: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // ESTADO VACÍO
    emptyContainer: {
        paddingVertical: 48,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    sinDatosTitulo: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },

    sinDatos: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
        maxWidth: 320,
    },
});