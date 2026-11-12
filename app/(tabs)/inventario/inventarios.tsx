
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

    // Obtener colores según el estado
    const obtenerColorEstado = (id_estado: number | null) => {

        switch (id_estado) {

            case 1:
                return {
                    fondo: '#DCFCE7',
                    texto: '#166534'
                };

            case 2:
                return {
                    fondo: '#FEF3C7',
                    texto: '#92400E'
                };

            case 3:
                return {
                    fondo: '#DBEAFE',
                    texto: '#1D4ED8'
                };

            case 4:
                return {
                    fondo: '#F3E8FF',
                    texto: '#7E22CE'
                };

            case 5:
                return {
                    fondo: '#FEE2E2',
                    texto: '#B91C1C'
                };

            default:
                return {
                    fondo: '#E2E8F0',
                    texto: '#475569'
                };
        }
    };

    // Consultar inventarios
    const cargarInventarios = useCallback(async (esActualizacion = false) => {

        try {

            setError('');

            const respuesta = await fetch(
                `${API_URL}/api/inventarios/`
            );

            if (!respuesta.ok) {
                throw new Error(
                    `Error del servidor: ${respuesta.status}`
                );
            }

            const datos: unknown = await respuesta.json();

            if (!Array.isArray(datos)) {
                throw new Error(
                    'La respuesta del servidor no tiene un formato válido.'
                );
            }

            setInventarios(datos as Inventario[]);

        } catch (error) {

            console.log('Error cargando inventarios:', error);

            const mensaje = error instanceof Error
                ? error.message
                : 'No fue posible cargar los inventarios.';

            setError(mensaje);

            if (esActualizacion) {
                Alert.alert(
                    'Error',
                    'No fue posible actualizar la lista de inventarios.'
                );
            }

        } finally {

            setCargando(false);
            setActualizando(false);

        }

    }, []);

    // Cargar al abrir la pantalla
    useEffect(() => {

        cargarInventarios();

    }, [cargarInventarios]);

    // Actualizar lista manualmente
    const actualizar = () => {

        setActualizando(true);
        cargarInventarios(true);

    };

    // Reintentar consulta
    const reintentar = () => {

        setCargando(true);
        cargarInventarios();

    };

    // Navegar al detalle del inventario
    const seleccionarInventario = (item: Inventario) => {

        // No permitir modificar inventarios completados
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

                    <Text style={styles.titulo}>
                        Inventarios
                    </Text>

                    <Text style={styles.subtitulo}>
                        Control de inventarios por categoría
                    </Text>

                </View>

            </View>

            {/* RESUMEN */}
            <View style={styles.resumen}>

                <View>

                    <Text style={styles.resumenTexto}>
                        Inventarios registrados
                    </Text>

                    <Text style={styles.resumenNumero}>
                        {inventarios.length}
                    </Text>

                </View>

                <View style={styles.iconoResumen}>

                    <Text style={styles.iconoTexto}>
                        INV
                    </Text>

                </View>

            </View>

            {/* CONTENIDO */}
            {cargando ? (

                <View style={styles.centro}>

                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text style={styles.mensaje}>
                        Cargando inventarios...
                    </Text>

                </View>

            ) : error && inventarios.length === 0 ? (

                <View style={styles.centro}>

                    <Text style={styles.error}>
                        {error}
                    </Text>

                    <Pressable
                        style={styles.botonReintentar}
                        onPress={reintentar}
                    >

                        <Text style={styles.botonTexto}>
                            Reintentar
                        </Text>

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
                            colors={['#2563EB']}
                        />
                    }
                >

                    {/* ERROR DE ACTUALIZACIÓN */}
                    {error !== '' && inventarios.length > 0 && (

                        <View style={styles.avisoError}>

                            <Text style={styles.avisoErrorTexto}>
                                No se pudo actualizar la información.
                            </Text>

                        </View>

                    )}

                    {/* LISTA VACÍA */}
                    {inventarios.length === 0 ? (

                        <View style={styles.vacio}>

                            <Text style={styles.vacioTitulo}>
                                No hay inventarios registrados
                            </Text>

                            <Text style={styles.vacioTexto}>
                                Los inventarios aparecerán aquí cuando sean creados.
                            </Text>

                        </View>

                    ) : (

                        inventarios.map((item) => {

                            const colores = obtenerColorEstado(
                                item.id_estado
                            );

                            const nombreEstado = obtenerEstado(
                                item.id_estado,
                                item.estado
                            );

                            const completado = item.id_estado === 1;

                            return (

                                <Pressable
                                    key={item.id_inventario}
                                    disabled={completado}
                                    onPress={() => seleccionarInventario(item)}
                                    style={({ pressed }) => [

                                        styles.tarjeta,

                                        pressed && !completado
                                            ? styles.tarjetaPresionada
                                            : null,

                                        completado
                                            ? styles.tarjetaCompletada
                                            : null

                                    ]}
                                >

                                    {/* NÚMERO Y ESTADO */}
                                    <View style={styles.tarjetaSuperior}>

                                        <View>

                                            <Text style={styles.etiqueta}>
                                                NÚMERO DE INVENTARIO
                                            </Text>

                                            <Text style={styles.numero}>
                                                #{item.id_inventario}
                                            </Text>

                                        </View>

                                        <View
                                            style={[
                                                styles.estado,
                                                {
                                                    backgroundColor: colores.fondo
                                                }
                                            ]}
                                        >

                                            <Text
                                                style={[
                                                    styles.estadoTexto,
                                                    {
                                                        color: colores.texto
                                                    }
                                                ]}
                                            >
                                                {nombreEstado}
                                            </Text>

                                        </View>

                                    </View>

                                    <View style={styles.divisor} />

                                    {/* CATEGORÍA */}
                                    <Text style={styles.etiqueta}>
                                        CATEGORÍA A INVENTARIAR
                                    </Text>

                                    <Text style={styles.categoria}>
                                        {item.categoria || 'Sin categoría'}
                                    </Text>

                                    {/* PIE DE TARJETA */}
                                    <View style={styles.pieTarjeta}>

                                        <Text
                                            style={[
                                                styles.textoSeleccionar,
                                                completado && styles.textoCompletado
                                            ]}
                                        >
                                            {completado
                                                ? 'Inventario finalizado'
                                                : 'Ver productos'
                                            }
                                        </Text>

                                        {!completado && (

                                            <Text style={styles.flecha}>
                                                →
                                            </Text>

                                        )}

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
        backgroundColor: '#F3F4F6',
    },

    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 18,
        backgroundColor: '#FFFFFF',
        gap: 15,
    },

    tituloContainer: {
        flex: 1,
    },

    titulo: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#172554',
    },

    subtitulo: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 3,
    },

    resumen: {
        margin: 16,
        padding: 18,
        backgroundColor: '#1E3A8A',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    resumenTexto: {
        color: '#DBEAFE',
        fontSize: 14,
    },

    resumenNumero: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 5,
    },

    iconoResumen: {
        borderWidth: 1,
        borderColor: '#93C5FD',
        borderRadius: 10,
        padding: 12,
    },

    iconoTexto: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    lista: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        gap: 12,
    },

    tarjeta: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },

    tarjetaPresionada: {
        backgroundColor: '#EFF6FF',
        borderColor: '#93C5FD',
    },

    tarjetaCompletada: {
        opacity: 0.8,
    },

    tarjetaSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    etiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.7,
    },

    numero: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 5,
    },

    estado: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },

    estadoTexto: {
        fontSize: 12,
        fontWeight: 'bold',
    },

    divisor: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 15,
    },

    categoria: {
        fontSize: 17,
        fontWeight: '600',
        color: '#334155',
        marginTop: 7,
    },

    pieTarjeta: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 15,
        gap: 8,
    },

    textoSeleccionar: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563EB',
    },

    textoCompletado: {
        color: '#64748B',
    },

    flecha: {
        fontSize: 19,
        color: '#2563EB',
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
    },

    error: {
        color: '#DC2626',
        textAlign: 'center',
    },

    avisoError: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
    },

    avisoErrorTexto: {
        color: '#B91C1C',
        fontSize: 13,
        textAlign: 'center',
    },

    botonReintentar: {
        backgroundColor: '#1D4ED8',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 15,
    },

    botonTexto: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    vacio: {
        alignItems: 'center',
        padding: 35,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },

    vacioTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#334155',
    },

    vacioTexto: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },

});
