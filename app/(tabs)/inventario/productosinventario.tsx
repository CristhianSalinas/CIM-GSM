import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import BotonVolver from '../../../componentes/botones/boton_volver';
import { API_URL } from '../../../constants/api';
import { obtenerToken } from '../../../constants/auth';

interface Producto {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_categoria: number;
    referencia: string;
    descripcion: string;
    precio: number;
    cantidad_fisica: number;
    cantidad_contada: string;
}

export default function ProductoInventario() {
    const router = useRouter();

    const {
        id_inventario,
        id_categoria,
        categoria
    } = useLocalSearchParams<{
        id_inventario: string;
        id_categoria: string;
        categoria: string;
    }>();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    const cargarProductos = useCallback(async (esActualizacion = false) => {
        try {
            setError('');
            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
            }

            const categoriaId = Number(id_categoria);
            if (!Number.isFinite(categoriaId)) {
                throw new Error('El identificador de categoría no es válido.');
            }

            const respuesta = await fetch(`${API_URL}/api/productos/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (respuesta.status === 401) {
                throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
            }

            if (respuesta.status === 403) {
                throw new Error('No tienes permisos para consultar los productos.');
            }

            if (!respuesta.ok) {
                throw new Error(`Error al consultar productos: ${respuesta.status}`);
            }

            const resultado = await respuesta.json();
            const listaProductos = Array.isArray(resultado) ? resultado : resultado?.productos;

            if (!Array.isArray(listaProductos)) {
                throw new Error('El servidor no devolvió una lista válida de productos.');
            }

            const productosFiltrados: Producto[] = listaProductos
                .filter((item: any) => Number(item.id_categoria) === categoriaId)
                .map((item: any) => ({
                    id_producto: Number(item.id_producto),
                    codigo_sm: item.codigo_sm ?? '',
                    nombre: item.nombre ?? item.Nombre ?? '',
                    id_categoria: Number(item.id_categoria),
                    referencia: item.referencia ?? '',
                    descripcion: item.descripcion ?? '',
                    precio: Number(item.precio ?? 0),
                    cantidad_fisica: Number(item.cantidad_fisica ?? item.Cantidad_fisica ?? 0),
                    cantidad_contada: ''
                }));

            setProductos(actuales =>
                productosFiltrados.map(item => {
                    const anterior = actuales.find(p => p.id_producto === item.id_producto);
                    return {
                        ...item,
                        cantidad_contada: anterior?.cantidad_contada ?? ''
                    };
                })
            );

        } catch (error) {
            console.log('Error cargando productos:', error);
            setError(error instanceof Error ? error.message : 'No fue posible cargar los productos.');
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, [id_categoria]);

    useEffect(() => {
        if (!id_inventario || !id_categoria) {
            setError('No se recibieron correctamente los datos del inventario.');
            setCargando(false);
            return;
        }
        cargarProductos();
    }, [id_inventario, id_categoria, cargarProductos]);

    const actualizar = () => {
        setActualizando(true);
        cargarProductos(true);
    };

    const reintentar = () => {
        setCargando(true);
        cargarProductos();
    };

    const modificarCantidad = (id_producto: number, valor: string) => {
        if (!/^\d*$/.test(valor)) return;
        setProductos(actuales =>
            actuales.map(item =>
                item.id_producto === id_producto ? { ...item, cantidad_contada: valor } : item
            )
        );
    };

    const calcularDiferencia = (item: Producto): number | null => {
        if (item.cantidad_contada === '') return null;
        return Number(item.cantidad_contada) - item.cantidad_fisica;
    };

    const productosContados = productos.filter(item => item.cantidad_contada !== '').length;
    const productosPendientes = productos.length - productosContados;

    const totalDiferencias = productos.reduce((total, item) => {
        const diferencia = calcularDiferencia(item);
        return total + (diferencia ?? 0);
    }, 0);

    const enviarInventario = () => {
    if (enviando) return;

    if (productos.length === 0) {
        mostrarMensaje('Sin productos', 'No hay productos para registrar.');
        return;
    }

    if (productosPendientes > 0) {
        mostrarMensaje(
            'Conteo incompleto',
            `Debes contar los ${productosPendientes} productos pendientes antes de finalizar.`
        );
        return;
    }

    const mensaje =
        `¿Confirmas el conteo de ${productos.length} productos de la categoría ${categoria || 'seleccionada'}?`;

    // Confirmación para navegador web
    if (Platform.OS === 'web') {
            const confirmar = window.confirm(
                `Finalizar inventario\n\n${mensaje}`
            );

            if (confirmar) {
                confirmarEnvio();
            }

            return;
        }

        // Confirmación para Android
        Alert.alert(
            'Finalizar inventario',
            mensaje,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Finalizar', onPress: confirmarEnvio }
            ]
        );
    };

    const mostrarMensaje = (titulo: string, mensaje: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensaje}`);
        } else {
            Alert.alert(titulo, mensaje);
        }
    };

    const confirmarEnvio = async () => {
        try {
            setEnviando(true);

            const token = await obtenerToken();

            if (!token) {
                throw new Error(
                    'No hay una sesión activa. Inicia sesión nuevamente.'
                );
            }

            const datos = {
                productos: productos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad_actual: Number(item.cantidad_contada),
                    observacion: null
                }))
            };

            console.log('DATOS ENVIADOS:', datos);

            const respuesta = await fetch(
                `${API_URL}/api/inventarios/${id_inventario}/finalizar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datos)
                }
            );

            const resultado = await respuesta.json().catch(() => null);

            console.log('RESPUESTA:', resultado);

            if (!respuesta.ok) {
                throw new Error(
                    resultado?.detail ||
                    resultado?.mensaje ||
                    `Error HTTP: ${respuesta.status}`
                );
            }

            mostrarMensaje(
                'Inventario finalizado',
                resultado?.mensaje || 'El conteo se guardó correctamente.'
            );

            router.back();

        } catch (error) {
            console.error('ERROR AL FINALIZAR:', error);

            mostrarMensaje(
                'Error al guardar',
                error instanceof Error
                    ? error.message
                    : 'No fue posible guardar el inventario.'
            );

        } finally {
            setEnviando(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* ENCABEZADO */}
                <View style={styles.encabezado}>
                    <BotonVolver />
                    <View style={styles.tituloContainer}>
                        <Text style={styles.title}>Conteo de Inventario</Text>
                        <Text style={styles.subtitle}>Registro de existencias físicas</Text>
                    </View>
                </View>

                {/* BARRA DE RESUMEN COMPACTA */}
                <View style={styles.infoBar}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>INV #</Text>
                        <Text style={styles.infoVal}>{id_inventario}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>CATEGORÍA</Text>
                        <Text style={styles.infoVal} numberOfLines={1}>{categoria || 'N/A'}</Text>
                    </View>
                    <View style={styles.dividerVertical} />
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>AVANCE</Text>
                        <Text style={styles.infoVal}>{productosContados}/{productos.length}</Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={actualizando}
                            onRefresh={actualizar}
                            colors={['#0F172A']}
                            tintColor="#0F172A"
                        />
                    }
                >
                    {cargando ? (
                        <View style={styles.centro}>
                            <ActivityIndicator size="large" color="#0F172A" />
                            <Text style={styles.mensaje}>Cargando productos...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centro}>
                            <Text style={styles.error}>{error}</Text>
                            <Pressable style={styles.botonReintentar} onPress={reintentar}>
                                <Text style={styles.botonTexto}>Reintentar</Text>
                            </Pressable>
                        </View>
                    ) : productos.length === 0 ? (
                        <View style={styles.vacio}>
                            <Text style={styles.vacioTitulo}>Sin productos</Text>
                            <Text style={styles.vacioTexto}>No hay elementos asociados a esta categoría.</Text>
                        </View>
                    ) : (
                        <View style={styles.listaProductos}>
                            {productos.map(item => {
                                const diferencia = calcularDiferencia(item);
                                const contado = item.cantidad_contada !== '';

                                return (
                                    <View key={item.id_producto} style={[styles.productoCard, contado && styles.cardContada]}>
                                        {/* CABECERA DE LA TARJETA */}
                                        <View style={styles.cardHeader}>
                                            <View style={styles.badgeCodigo}>
                                                <Text style={styles.badgeText}>{item.codigo_sm || 'S/C'}</Text>
                                            </View>
                                            <Text style={styles.referenciaText}>Ref: {item.referencia || 'N/A'}</Text>
                                        </View>

                                        <Text style={styles.nombreProducto}>{item.nombre}</Text>
                                        {!!item.descripcion && (
                                            <Text style={styles.descProducto}>{item.descripcion}</Text>
                                        )}

                                        <View style={styles.dividerHorizontal} />

                                        {/* FILA DE INPUTS Y DATOS */}
                                        <View style={styles.cardBody}>
                                            <View style={styles.colStock}>
                                                <Text style={styles.subLabel}>S. Sistema</Text>
                                                <Text style={styles.stockVal}>{item.cantidad_fisica}</Text>
                                            </View>

                                            <View style={styles.colInput}>
                                                <Text style={styles.subLabel}>Físico Contado</Text>
                                                <TextInput
                                                    style={styles.inputCantidad}
                                                    value={item.cantidad_contada}
                                                    onChangeText={valor => modificarCantidad(item.id_producto, valor)}
                                                    keyboardType="number-pad"
                                                    placeholder="0"
                                                    placeholderTextColor="#94A3B8"
                                                    maxLength={6}
                                                    editable={!enviando}
                                                />
                                            </View>
                                        </View>

                                        {/* DIFERENCIA */}
                                        {diferencia !== null && (
                                            <View style={[
                                                styles.footerDiferencia,
                                                diferencia > 0 && styles.difPositivaBg,
                                                diferencia < 0 && styles.difNegativaBg,
                                                diferencia === 0 && styles.difNeutroBg
                                            ]}>
                                                <Text style={styles.difLabelText}>Diferencia:</Text>
                                                <Text style={[
                                                    styles.difValText,
                                                    diferencia > 0 && styles.textPositivo,
                                                    diferencia < 0 && styles.textNegativo,
                                                    diferencia === 0 && styles.textNeutro
                                                ]}>
                                                    {diferencia > 0 ? `+${diferencia}` : diferencia} unidades
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* BOTÓN FINALIZAR */}
                    {!cargando && !error && productos.length > 0 && (
                        <View style={styles.finalizarContainer}>
                            <Text style={styles.avisoFinalizar}>
                                {productosPendientes > 0
                                    ? `Faltan ${productosPendientes} productos por registrar conteo.`
                                    : 'Todo listo. Verifique y proceda a finalizar el inventario.'}
                            </Text>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.botonFinalizar,
                                    pressed && styles.botonPresionado,
                                    (enviando || productosPendientes > 0) &&
                                        styles.botonDeshabilitado
                                ]}
                                onPress={enviarInventario}
                                disabled={enviando || productosPendientes > 0}
                            >
                                {enviando ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.textoBotonFinalizar}>
                                        FINALIZAR INVENTARIO
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 12,
    },
    tituloContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    subtitle: {
        color: '#64748B',
        fontSize: 11,
        marginTop: 1,
    },
    infoBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    infoVal: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 2,
    },
    dividerVertical: {
        width: 1,
        height: 24,
        backgroundColor: '#E2E8F0',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    listaProductos: {
        gap: 12,
    },
    productoCard: {
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    cardContada: {
        borderColor: '#CBD5E1',
        backgroundColor: '#FCFCFD',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    badgeCodigo: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#334155',
    },
    referenciaText: {
        fontSize: 11,
        color: '#64748B',
    },
    nombreProducto: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    descProducto: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    dividerHorizontal: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colStock: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    colInput: {
        flex: 1.2,
    },
    subLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    stockVal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    inputCantidad: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 6,
        height: 38,
        fontSize: 16,
        fontWeight: '700',
        color: '#15803D',
        textAlign: 'center',
    },
    footerDiferencia: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    difPositivaBg: {
        backgroundColor: '#EFF6FF',
    },
    difNegativaBg: {
        backgroundColor: '#FEF2F2',
    },
    difNeutroBg: {
        backgroundColor: '#F8FAFC',
    },
    difLabelText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    difValText: {
        fontSize: 11,
        fontWeight: '700',
    },
    textPositivo: {
        color: '#1D4ED8',
    },
    textNegativo: {
        color: '#DC2626',
    },
    textNeutro: {
        color: '#15803D',
    },
    finalizarContainer: {
        marginTop: 20,
    },
    avisoFinalizar: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 8,
    },
    botonFinalizar: {
        backgroundColor: '#0F172A',
        height: 44,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botonPresionado: {
        opacity: 0.9,
    },
    botonDeshabilitado: {
        backgroundColor: '#94A3B8',
        opacity: 0.7,
    },
    textoBotonFinalizar: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    centro: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mensaje: {
        color: '#64748B',
        marginTop: 8,
        fontSize: 12,
    },
    error: {
        color: '#DC2626',
        textAlign: 'center',
        fontSize: 12,
    },
    botonReintentar: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 12,
    },
    botonTexto: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
    vacio: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    vacioTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    vacioTexto: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 4,
    },
});