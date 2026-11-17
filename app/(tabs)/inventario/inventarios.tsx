import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';

import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import BotonVolver from '../../../componentes/botones/boton_volver';
import { obtenerToken, tokenExpirado, eliminarToken } from '../../../constants/auth';
import { API_URL } from '../../../constants/api';

interface Inventario {
    id_inventario: number;
    id_usuario: number;
    id_categoria: number;
    id_ubicacion: number;
    fecha: string;
    id_estado: number;
    observacion: string | null;
}

export default function Inventarios() {
    const router = useRouter();

    const [inventarios, setInventarios] = useState<Inventario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState('');

    // CONFIGURACIÓN VISUAL DE ESTADOS (Consistente con el resto del sistema)
    const obtenerConfigEstado = (id_estado: number | null) => {
        switch (id_estado) {
            case 1:
                return {
                    label: 'COMPLETADO',
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
                    label: 'SIN ESTADO',
                    color: '#475569',
                    bg: '#F1F5F9',
                    border: '#E2E8F0',
                };
        }
    };

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return fecha;

        return fechaObj.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const Crearinventarios = () => {
        router.push('/inventario/crearinventario');
      };
    

    // CONSULTAR INVENTARIOS
    const cargarInventarios = useCallback(async (esActualizacion = false) => {
        try {
            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay token de autenticación.');
            }

            if (tokenExpirado(token)) {
                await eliminarToken();
                throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
            }

            setError('');

            const respuesta = await fetch(`${API_URL}/api/inventarios/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (respuesta.status === 401) {
                await eliminarToken();
                throw new Error('Sesión inválida o expirada. Inicia sesión nuevamente.');
            }

            if (!respuesta.ok) {
                throw new Error(`Error del servidor: ${respuesta.status}`);
            }

            const datos: unknown = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error('La respuesta del servidor no tiene un formato válido.');
            }

            setInventarios(datos as Inventario[]);
        } catch (err) {
            console.log('Error cargando inventarios:', err);

            const mensaje =
                err instanceof Error
                    ? err.message
                    : 'No fue posible cargar los inventarios.';

            setError(mensaje);

            if (esActualizacion) {
                Alert.alert('Error', mensaje);
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

    console.log('Inventario seleccionado:', item);

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

    console.log('Intentando navegar...');

    router.push({
        pathname: '/inventario/productosinventario',
        params: {
            id_inventario: String(item.id_inventario),
            id_categoria: String(item.id_categoria),
        },
    });
};

    if (cargando) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.textoCarga}>Cargando inventarios...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contenedor}>
                    {/* NAVEGACIÓN */}

                    <View style={styles.navegacion}>
                        <BotonVolver />

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.botonCrear,
                                        pressed && { opacity: 0.8 }
                                    ]}
                                    onPress={Crearinventarios}
                                    >
                                    <Text style={styles.botonCrearTexto}>Crear inventario</Text>
                                    </Pressable>
                    </View>                    
                    
                    
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={styles.titulo}>Control de inventarios</Text>
                            <View style={[styles.badgeTipo, styles.badgeInventario]}>
                                <Text style={[styles.textoBadgeTipo, { color: '#1D4ED8' }]}>
                                    INVENTARIO
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.subtitulo}>
                            Selecciona un inventario activo para gestionar el conteo por categorías.
                        </Text>
                    </View>

                    {/* BARRA DE RESUMEN */}
                    <View style={styles.resumen}>
                        <Text style={styles.textoResumen}>
                            Mostrando{' '}
                            <Text style={styles.numeroResumen}>{inventarios.length}</Text>{' '}
                            {inventarios.length === 1 ? 'inventario' : 'inventarios'}
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
                    {error !== '' && inventarios.length > 0 && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                No se pudo actualizar la información en tiempo real.
                            </Text>
                        </View>
                    )}

                    {error !== '' && inventarios.length === 0 ? (
                        <View style={styles.tablaContenedor}>
                            <View style={styles.emptyContainer}>
                                <Text style={styles.errorTitle}>Error de conexión</Text>
                                <Text style={styles.sinDatos}>{error}</Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.botonReintentar,
                                        pressed && { opacity: 0.85 },
                                    ]}
                                    onPress={reintentar}
                                >
                                    <Text style={styles.botonReintentarTexto}>Reintentar</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        /* TABLA */
                        <View style={styles.tablaContenedor}>
                            {/* ENCABEZADO */}
                            <View style={[styles.fila, styles.encabezado]}>
                                <Text style={[styles.celda, styles.colId, styles.textoEncabezado]}>
                                    ID / FECHA
                                </Text>
                                <Text style={[styles.celda, styles.colObs, styles.textoEncabezado]}>
                                    OBSERVACIÓN
                                </Text>
                                <Text
                                    style={[
                                        styles.celda,
                                        styles.colEstado,
                                        styles.textoEncabezado,
                                        { textAlign: 'center' },
                                    ]}
                                >
                                    ESTADO
                                </Text>
                                <Text
                                    style={[
                                        styles.celda,
                                        styles.colAccion,
                                        styles.textoEncabezado,
                                        styles.sinBordeDerecho,
                                        { textAlign: 'right' },
                                    ]}
                                >
                                    ACCIÓN
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
                                {inventarios.map((item, index) => {
                                    const estado = obtenerConfigEstado(item.id_estado);
                                    const completado = item.id_estado === 1;
                                    const esPar = index % 2 === 0;

                                    return (
                                        <Pressable
                                            key={item.id_inventario}
                                            disabled={completado}
                                            onPress={() => seleccionarInventario(item)}
                                            style={({ pressed }) => [
                                                styles.fila,
                                                esPar ? styles.filaPar : styles.filaImpar,
                                                completado && styles.filaCompletada,
                                                pressed && !completado && styles.filaPresionada,
                                            ]}
                                        >
                                            {/* ID Y FECHA */}
                                            <View style={[styles.celda, styles.colId, styles.celdaInicio]}>
                                                <View style={styles.pillId}>
                                                    <Text style={styles.textoId}>
                                                        #{item.id_inventario}
                                                    </Text>
                                                </View>
                                                <Text style={styles.textoFecha}>
                                                    {formatearFecha(item.fecha)}
                                                </Text>
                                            </View>

                                            {/* OBSERVACIÓN */}
                                            <Text
                                                style={[
                                                    styles.celda,
                                                    styles.colObs,
                                                    item.observacion
                                                        ? styles.textoPrincipal
                                                        : styles.textoSecundario,
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {item.observacion || 'Sin observación'}
                                            </Text>

                                            {/* ESTADO */}
                                            <View
                                                style={[
                                                    styles.celda,
                                                    styles.colEstado,
                                                    styles.celdaCentrada,
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

                                            {/* ACCIÓN */}
                                            <View
                                                style={[
                                                    styles.celda,
                                                    styles.colAccion,
                                                    styles.celdaDerecha,
                                                    styles.sinBordeDerecho,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.textoAccion,
                                                        completado && styles.textoAccionDeshabilitado,
                                                    ]}
                                                >
                                                    {completado ? 'Cerrado' : 'Gestionar ›'}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}

                                {inventarios.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.sinDatosTitulo}>Sin inventarios</Text>
                                        <Text style={styles.sinDatos}>
                                            Los registros de inventario aparecerán aquí cuando sean creados.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
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

     navegacion: {
        marginTop: 12,
        marginBottom: 12
    },


      botonCrear: {
    backgroundColor: '#C48703',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginBottom: 10,
    shadowColor: '#C48703',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botonCrearTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

    badgeInventario: {
        backgroundColor: '#DBEAFE',
        borderColor: '#BFDBFE',
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

    // ERRORES
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },

    errorText: {
        color: '#B91C1C',
        fontSize: 12,
        fontWeight: '500',
    },

    errorTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B91C1C',
        marginBottom: 4,
    },

    botonReintentar: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 8,
        marginTop: 14,
    },

    botonReintentarTexto: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
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
        minHeight: 52,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    filaPar: {
        backgroundColor: '#FFFFFF',
    },

    filaImpar: {
        backgroundColor: '#F8FAFC',
    },

    filaCompletada: {
        opacity: 0.72,
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
        gap: 4,
    },

    celdaCentrada: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    celdaDerecha: {
        alignItems: 'flex-end',
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

    textoSecundario: {
        color: '#94A3B8',
        fontSize: 12.5,
        fontStyle: 'italic',
    },

    // COLUMNAS RESPONSIVAS AL 100%
    colId: {
        flex: 1.1,
        minWidth: 110,
    },

    colObs: {
        flex: 2.2,
        minWidth: 140,
    },

    colEstado: {
        flex: 1.2,
        minWidth: 125,
    },

    colAccion: {
        flex: 1,
        minWidth: 95,
    },

    // PILLS Y BADGES
    pillId: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    textoId: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    textoFecha: {
        fontSize: 11,
        color: '#64748B',
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

    textoAccion: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#1D4ED8',
    },

    textoAccionDeshabilitado: {
        color: '#94A3B8',
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