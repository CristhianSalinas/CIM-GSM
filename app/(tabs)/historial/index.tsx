import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Dimensions,
} from 'react-native';

import { API_URL } from '../../../constants/api';
import { obtenerToken } from '../../../constants/auth';
import BotonInicio from '../../../componentes/botones/boton_inicio';

interface Movimiento {
    id: number;
    id_movimentos: number;
    id_usuario: number;
    id_producto: number;
    fecha: string;
    observacion: string | null;
    id_pedido: number | null;
    id_estado: number | null;
    cantidad: number | null;
    id_inventario: number | null;
    producto: string;
    codigo_sm: string;
    usuario: string;
}

export default function Historial() {
    const [historial, setHistorial] = useState<Movimiento[]>([]);
    const [historialFiltrado, setHistorialFiltrado] = useState<Movimiento[]>([]);

    const [busqueda, setBusqueda] = useState('');
    const [tipoSeleccionado, setTipoSeleccionado] = useState(0);

    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState('');

    const cargarHistorial = useCallback(async () => {
        try {
            setError('');
            const token = await obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/api/historial_movimientos/historial`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.detail || 'No fue posible consultar el historial.'
                );
            }

            if (!Array.isArray(datos)) {
                throw new Error('La respuesta del servidor no tiene el formato esperado.');
            }

            setHistorial(datos);
        } catch (e: any) {
            console.error('Error cargando historial:', e);
            setError(e.message || 'Error al cargar el historial.');
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, []);

    useEffect(() => {
        cargarHistorial();
    }, [cargarHistorial]);

    useEffect(() => {
        let resultado = [...historial];

        if (tipoSeleccionado !== 0) {
            resultado = resultado.filter(
                item => item.id_movimentos === tipoSeleccionado
            );
        }

        if (busqueda.trim() !== '') {
            const texto = busqueda.toLowerCase().trim();

            resultado = resultado.filter(item =>
                String(item.producto || '').toLowerCase().includes(texto) ||
                String(item.codigo_sm || '').toLowerCase().includes(texto) ||
                String(item.usuario || '').toLowerCase().includes(texto) ||
                String(item.observacion || '').toLowerCase().includes(texto) ||
                String(item.id_pedido || '').includes(texto)
            );
        }

        setHistorialFiltrado(resultado);
    }, [historial, busqueda, tipoSeleccionado]);

    const actualizar = () => {
        setActualizando(true);
        cargarHistorial();
    };

    const obtenerEstiloTipo = (tipo: number) => {
        switch (tipo) {
            case 1:
                return {
                    label: 'ENTRADA',
                    color: '#15803D',
                    bg: '#DCFCE7',
                    border: '#BBF7D0',
                    prefijo: '+',
                };
            case 2:
                return {
                    label: 'SALIDA',
                    color: '#B91C1C',
                    bg: '#FEE2E2',
                    border: '#FECACA',
                    prefijo: '-',
                };
            case 3:
                return {
                    label: 'INVENTARIO',
                    color: '#1D4ED8',
                    bg: '#DBEAFE',
                    border: '#BFDBFE',
                    prefijo: '',
                };
            default:
                return {
                    label: 'OTRO',
                    color: '#475569',
                    bg: '#F1F5F9',
                    border: '#E2E8F0',
                    prefijo: '',
                };
        }
    };

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return fecha;

        return fechaObj.toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    if (cargando) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.textoCarga}>Cargando historial de movimientos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.contenedor}>
            <View>
                <BotonInicio />
            </View>         

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.titulo}>Historial de movimientos</Text>
                <Text style={styles.subtitulo}>
                    Trazabilidad de entradas, salidas y ajustes de inventario
                </Text>
            </View>

            {/* BUSCADOR */}
            <View style={styles.buscadorWrapper}>
                <TextInput
                    style={styles.busqueda}
                    placeholder="Buscar por producto, código, usuario o N° pedido..."
                    placeholderTextColor="#94A3B8"
                    value={busqueda}
                    onChangeText={setBusqueda}
                />
                {busqueda.length > 0 && (
                    <Pressable
                        onPress={() => setBusqueda('')}
                        style={styles.botonLimpiar}
                        hitSlop={8}
                    >
                        <Text style={styles.textoLimpiar}>✕</Text>
                    </Pressable>
                )}
            </View>

            {/* FILTROS */}
            <View style={styles.filtros}>
                {[
                    { id: 0, nombre: 'Todos' },
                    { id: 1, nombre: 'Entradas' },
                    { id: 2, nombre: 'Salidas' },
                    { id: 3, nombre: 'Inventario' },
                ].map(filtro => {
                    const activo = tipoSeleccionado === filtro.id;
                    return (
                        <Pressable
                            key={filtro.id}
                            style={[
                                styles.botonFiltro,
                                activo && styles.botonFiltroActivo,
                            ]}
                            onPress={() => setTipoSeleccionado(filtro.id)}
                        >
                            <Text
                                style={[
                                    styles.textoFiltro,
                                    activo && styles.textoFiltroActivo,
                                ]}
                            >
                                {filtro.nombre}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* BARRA DE RESUMEN */}
            <View style={styles.resumen}>
                <Text style={styles.textoResumen}>
                    Mostrando <Text style={styles.numeroResumen}>{historialFiltrado.length}</Text> registros
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

            {/* MENSAJE DE ERROR */}
            {error !== '' && (
                <View style={styles.errorBox}>
                    <Text style={styles.error}>{error}</Text>
                </View>
            )}

            {/* TABLA ADAPTADA PARA ANDROID Y WEB */}
            <View style={styles.tablaContenedor}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.scrollHorizontalContent}
                >
                    <ScrollView
                        style={styles.scrollVertical}
                        refreshControl={
                            <RefreshControl
                                refreshing={actualizando}
                                onRefresh={actualizar}
                                colors={['#1D4ED8']}
                                tintColor="#1D4ED8"
                            />
                        }
                    >
                        <View style={styles.tabla}>
                            {/* ENCABEZADO */}
                            <View style={[styles.fila, styles.encabezado]}>
                                <Text style={[styles.celda, styles.fecha, styles.textoEncabezado]}>FECHA Y HORA</Text>
                                <Text style={[styles.celda, styles.tipo, styles.textoEncabezado, { textAlign: 'center' }]}>TIPO</Text>
                                <Text style={[styles.celda, styles.codigo, styles.textoEncabezado]}>CÓDIGO</Text>
                                <Text style={[styles.celda, styles.producto, styles.textoEncabezado]}>PRODUCTO</Text>
                                <Text style={[styles.celda, styles.cantidad, styles.textoEncabezado]}>CANT.</Text>
                                <Text style={[styles.celda, styles.usuario, styles.textoEncabezado]}>USUARIO</Text>
                                <Text style={[styles.celda, styles.pedido, styles.textoEncabezado, styles.sinBordeDerecho]}>PEDIDO</Text>
                            </View>

                            {/* FILAS DE DATOS */}
                            {historialFiltrado.length > 0 ? (
                                historialFiltrado.map((item, index) => {
                                    const estiloTipo = obtenerEstiloTipo(item.id_movimentos);
                                    const esPar = index % 2 === 0;

                                    return (
                                        <View key={item.id} style={[styles.fila, esPar ? styles.filaPar : styles.filaImpar]}>
                                            <Text style={[styles.celda, styles.fecha, styles.textoSecundario]} numberOfLines={1}>
                                                {formatearFecha(item.fecha)}
                                            </Text>

                                            <View style={[styles.celda, styles.tipo, styles.celdaCentrada]}>
                                                <View style={[styles.badge, { backgroundColor: estiloTipo.bg, borderColor: estiloTipo.border }]}>
                                                    <Text style={[styles.textoTipo, { color: estiloTipo.color }]}>
                                                        {estiloTipo.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={[styles.celda, styles.codigo, styles.textoCodigo]} numberOfLines={1}>
                                                {item.codigo_sm || '-'}
                                            </Text>

                                            <Text style={[styles.celda, styles.producto, styles.textoPrincipal]} numberOfLines={1}>
                                                {item.producto || '-'}
                                            </Text>

                                            <Text style={[styles.celda, styles.cantidad, styles.textoCantidad, { color: estiloTipo.color }]}>
                                                {estiloTipo.prefijo}{item.cantidad ?? 0}
                                            </Text>

                                            <Text style={[styles.celda, styles.usuario, styles.textoSecundario]} numberOfLines={1}>
                                                {item.usuario || '-'}
                                            </Text>

                                            <View style={[styles.celda, styles.pedido, styles.celdaCentrada, styles.sinBordeDerecho]}>
                                                {item.id_pedido ? (
                                                    <View style={styles.pillPedido}>
                                                        <Text style={styles.textoPedido}>#{item.id_pedido}</Text>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.textoSecundario}>-</Text>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.sinDatosTitulo}>Sin resultados</Text>
                                    <Text style={styles.sinDatos}>
                                        No se encontraron movimientos con los filtros actuales.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    header: {
        marginBottom: 14,
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
    buscadorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 42,
        marginBottom: 12,
    },
    busqueda: {
        flex: 1,
        fontSize: 13,
        color: '#1E293B',
        height: '100%',
    },
    botonLimpiar: {
        backgroundColor: '#E2E8F0',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    textoLimpiar: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '700',
    },
    filtros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    botonFiltro: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 20,
    },
    botonFiltroActivo: {
        backgroundColor: '#1E293B',
        borderColor: '#1E293B',
    },
    textoFiltro: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    textoFiltroActivo: {
        color: '#FFFFFF',
    },
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
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    error: {
        color: '#B91C1C',
        fontSize: 12,
        fontWeight: '500',
    },
    tablaContenedor: {
        flex: 1,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        overflow: 'hidden',
    },
    scrollHorizontalContent: {
        flexGrow: 1,
        minWidth: '100%',
    },
    scrollVertical: {
        flex: 1,
    },
    tabla: {
        width: 980, // Ancho calculado exacto para que abarque todas las columnas sin cortes en Android
    },
    fila: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        minHeight: 44,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filaPar: {
        backgroundColor: '#FFFFFF',
    },
    filaImpar: {
        backgroundColor: '#F8FAFC',
    },
    encabezado: {
        minHeight: 42,
        backgroundColor: '#F1F5F9',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
    },
    celda: {
        fontSize: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
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
    },
    textoSecundario: {
        color: '#64748B',
        fontSize: 11.5,
    },
    textoCodigo: {
        color: '#334155',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 11.5,
    },
    textoCantidad: {
        fontWeight: '700',
        fontSize: 12.5,
    },
    // Tamaños óptimos en pixeles para que la tabla no se corte en Android
    fecha: { width: 160 },
    tipo: { width: 115 },
    codigo: { width: 110 },
    producto: { width: 250 },
    cantidad: { width: 85, textAlign: 'center' },
    usuario: { width: 170 },
    pedido: { width: 90, textAlign: 'center' },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    textoTipo: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    pillPedido: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    textoPedido: {
        fontSize: 11,
        fontWeight: '600',
        color: '#334155',
    },
    emptyContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: 980,
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
    },
});