import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import BotonVolver from '../../../componentes/botones/boton_volver';
import { API_URL } from '../../../constants/api';

interface Inventario {
    id_inventario: number;
    id_categoria: number | null;
    categoria: string | null;
    id_estado: number | null;
    estado: string | null;
}

export default function Inventarios() {

    const router = useRouter();

    const [inventarios, setInventarios] = useState<Inventario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState('');

    // Obtener nombre del estado
    const obtenerEstado = (
        id_estado: number | null,
        nombre: string | null
    ): string => {
        const estados: Record<number, string> = {
            1: 'Completado',
            2: 'Pendiente',
            3: 'En progreso',
            4: 'En pausa',
            5: 'Cancelado'
        };

        return id_estado !== null
            ? estados[id_estado] || nombre || 'Sin estado'
            : nombre || 'Sin estado';
    };

    // Obtener colores sobrios y modernos según el estado
    const obtenerConfigEstado = (id_estado: number | null) => {
        switch (id_estado) {
            case 1:
                return { fondo: '#F0FDF4', texto: '#15803D', borde: '#BBF7D0', indicador: '#22C55E' };
            case 2:
                return { fondo: '#FFFBEB', texto: '#B45309', borde: '#FEF3C7', indicador: '#F59E0B' };
            case 3:
                return { fondo: '#EFF6FF', texto: '#1D4ED8', borde: '#BFDBFE', indicador: '#3B82F6' };
            case 4:
                return { fondo: '#FAF5FF', texto: '#7E22CE', borde: '#E9D5FF', indicador: '#A855F7' };
            case 5:
                return { fondo: '#FEF2F2', texto: '#B91C1C', borde: '#FECACA', indicador: '#EF4444' };
            default:
                return { fondo: '#F1F5F9', texto: '#475569', borde: '#E2E8F0', indicador: '#94A3B8' };
        }
    };

    // Consultar inventarios
    const cargarInventarios = useCallback(async (esActualizacion = false) => {
        try {
            setError('');
            const respuesta = await fetch(`${API_URL}/api/inventarios/`);

            if (!respuesta.ok) {
                throw new Error(`Error del servidor: ${respuesta.status}`);
            }

            const datos: unknown = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error('La respuesta del servidor no tiene un formato válido.');
            }

            setInventarios(datos as Inventario[]);
        } catch (error) {
            console.log('Error cargando inventarios:', error);
            const mensaje = error instanceof Error ? error.message : 'No fue posible cargar los inventarios.';
            setError(mensaje);

            if (esActualizacion) {
                Alert.alert('Error', 'No fue posible actualizar la lista de inventarios.');
            }
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, []);

    useEffect(() => {
        cargarInventarios();
    }, [cargarInventarios]);

    const actualizar = () => {
        setActualizando(true);
        cargarInventarios(true);
    };

    const reintentar = () => {
        setCargando(true);
        cargarInventarios();
    };

    const seleccionarInventario = (item: Inventario) => {
        if (item.id_estado === 1) {
            Alert.alert(
                'Inventario completado',
                'Este inventario ya fue finalizado y no puede modificarse.'
            );
            return;
        }

        if (item.id_categoria === null) {
            Alert.alert(
                'Categoría no disponible',
                'Este inventario no tiene una categoría asignada.'
            );
            return;
        }

        router.push({
            pathname: '/inventario/productosinventario',
            params: {
                id_inventario: String(item.id_inventario),
                id_categoria: String(item.id_categoria),
                categoria: item.categoria || 'Sin categoría'
            }
        });
    };

    return (
        <SafeAreaView style={styles.contenedor}>
            {/* ENCABEZADO */}
            <View style={styles.encabezado}>
                <BotonVolver />
                <View style={styles.tituloContainer}>
                    <Text style={styles.titulo}>Control de Inventarios</Text>
                    <Text style={styles.subtitulo}>Gestión por categorías</Text>
                </View>
            </View>

            {/* RESUMEN MINIMALISTA */}
            <View style={styles.resumenCard}>
                <View style={styles.resumenInfo}>
                    <Text style={styles.resumenLabel}>TOTAL REGISTROS</Text>
                    <Text style={styles.resumenNumero}>{inventarios.length}</Text>
                </View>
                <View style={styles.resumenBadge}>
                    <Text style={styles.resumenBadgeText}>Activo</Text>
                </View>
            </View>

            {/* CONTENIDO */}
            {cargando ? (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color="#0F172A" />
                    <Text style={styles.mensaje}>Cargando inventarios...</Text>
                </View>
            ) : error && inventarios.length === 0 ? (
                <View style={styles.centro}>
                    <Text style={styles.error}>{error}</Text>
                    <Pressable style={styles.botonReintentar} onPress={reintentar}>
                        <Text style={styles.botonTexto}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.lista}
                    refreshControl={
                        <RefreshControl
                            refreshing={actualizando}
                            onRefresh={actualizar}
                            colors={['#0F172A']}
                            tintColor="#0F172A"
                        />
                    }
                >
                    {error !== '' && inventarios.length > 0 && (
                        <View style={styles.avisoError}>
                            <Text style={styles.avisoErrorTexto}>No se pudo actualizar la información en tiempo real.</Text>
                        </View>
                    )}

                    {inventarios.length === 0 ? (
                        <View style={styles.vacio}>
                            <Text style={styles.vacioTitulo}>Sin inventarios</Text>
                            <Text style={styles.vacioTexto}>Los registros aparecerán aquí cuando sean creados.</Text>
                        </View>
                    ) : (
                        inventarios.map((item) => {
                            const configEstado = obtenerConfigEstado(item.id_estado);
                            const nombreEstado = obtenerEstado(item.id_estado, item.estado);
                            const completado = item.id_estado === 1;

                            return (
                                <Pressable
                                    key={item.id_inventario}
                                    disabled={completado}
                                    onPress={() => seleccionarInventario(item)}
                                    style={({ pressed }) => [
                                        styles.tarjeta,
                                        { borderLeftColor: configEstado.indicador },
                                        pressed && !completado ? styles.tarjetaPresionada : null,
                                        completado ? styles.tarjetaCompletada : null
                                    ]}
                                >
                                    <View style={styles.tarjetaHeader}>
                                        <Text style={styles.idInventario}>INV #{item.id_inventario}</Text>
                                        <View style={[styles.badgeEstado, { backgroundColor: configEstado.fondo, borderColor: configEstado.borde }]}>
                                            <View style={[styles.puntoEstado, { backgroundColor: configEstado.indicador }]} />
                                            <Text style={[styles.textoEstado, { color: configEstado.texto }]}>
                                                {nombreEstado}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.categoriaNombre}>
                                        {item.categoria || 'Sin categoría'}
                                    </Text>

                                    <View style={styles.tarjetaFooter}>
                                        <Text style={[styles.textoAccion, completado && styles.textoCompletadoText]}>
                                            {completado ? 'Finalizado' : 'Gestionar productos'}
                                        </Text>
                                        {!completado && <Text style={styles.flecha}>›</Text>}
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 12,
    },
    tituloContainer: {
        flex: 1,
    },
    titulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },
    subtitulo: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    resumenCard: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resumenInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    resumenLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    resumenNumero: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    resumenBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    resumenBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },
    lista: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        paddingBottom: 30,
        gap: 10,
    },
    tarjeta: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 4, // Estilo profesional tipo barra lateral de color
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tarjetaPresionada: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    tarjetaCompletada: {
        opacity: 0.75,
        backgroundColor: '#FCFCFD',
    },
    tarjetaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    idInventario: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.5,
    },
    badgeEstado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        gap: 5,
    },
    puntoEstado: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    textoEstado: {
        fontSize: 11,
        fontWeight: '600',
    },
    categoriaNombre: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginVertical: 4,
    },
    tarjetaFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    textoAccion: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0284C7',
    },
    textoCompletadoText: {
        color: '#94A3B8',
    },
    flecha: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0284C7',
    },
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    mensaje: {
        color: '#64748B',
        marginTop: 10,
        fontSize: 13,
    },
    error: {
        color: '#DC2626',
        textAlign: 'center',
        fontSize: 13,
    },
    avisoError: {
        backgroundColor: '#FEF2F2',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginBottom: 4,
    },
    avisoErrorTexto: {
        color: '#B91C1C',
        fontSize: 12,
        textAlign: 'center',
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
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 20,
    },
    vacioTitulo: {
        fontSize: 15,
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