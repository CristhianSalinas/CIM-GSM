import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    Alert,
    StyleSheet,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../../constants/api';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { obtenerToken, tokenExpirado, eliminarToken } from '../../../constants/auth';
import { useUsuarioActual } from '../../../hooks/useUsuarioActual';

interface Categoria {
    id_categoria: number;
    nombre: string;
}

interface Producto {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_categoria: number;
    cantidad_fisica: number;
}



export default function CrearSalida() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productosCategoria, setProductosCategoria] = useState<Producto[]>([]);

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
    const [mostrarCategorias, setMostrarCategorias] = useState(false);

    const [buscando, setBuscando] = useState(false);
     const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

     const {usuarioActual} = useUsuarioActual();

    const id_movimiento_inventario = 3;

    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            setCargando(true);

            const token = await obtenerToken();

            if (!token) throw new Error('No hay token de autenticación.');

            if (tokenExpirado(token)) {
                await eliminarToken();
                throw new Error('Tu sesión ha expirado.');
            }

            const [respuestaCategorias] = await Promise.all([
                fetch(`${API_URL}/api/Categorias`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            

            const datosCategorias = await respuestaCategorias.json();
            setCategorias(datosCategorias);

        } catch (error) {
            console.error('ERROR CARGANDO DATOS:', error);

            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Error cargando información.'
            );
        } finally {
            setCargando(false);
        }
    };


    
        const seleccionarCategoria = async (id_categoria: number) => {
            try {
                setCategoriaSeleccionada(id_categoria);

                const token = await obtenerToken();

                if (!token) {
                    throw new Error('No hay sesión activa.');
                }

                const respuesta = await fetch(
                    `${API_URL}/api/productos/categoria?id_Categoria=${id_categoria}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!respuesta.ok) {
                    const error = await respuesta.text();
                    throw new Error(`Error ${respuesta.status}: ${error}`);
                }

                const productosEncontrados = await respuesta.json();

                setProductosCategoria(
                    Array.isArray(productosEncontrados) ? productosEncontrados : []
                );

                setMostrarCategorias(false);

                console.log('Categoría seleccionada:', id_categoria);
                console.log('Productos encontrados:', productosEncontrados);

            } catch (error) {
                console.error('Error al consultar productos:', error);
            }
        };





        const mostrarMensaje = (titulo: string, mensaje: string) => {
            if (Platform.OS === 'web') {
                window.alert(`${titulo}\n\n${mensaje}`);
            } else {
                Alert.alert(titulo, mensaje);
            }
        };




        const crearInventario = async () => {

                if (!categoriaSeleccionada) {
                    mostrarMensaje('Atención', 'Selecciona una categoría.');
                    return;
                }

                if (productosCategoria.length === 0) {
                    mostrarMensaje('Atención', 'Esta categoría no tiene productos.');
                    return;
                }

                if (!usuarioActual?.id_usuario) {
                    mostrarMensaje('Error', 'No se pudo identificar al usuario.');
                    return;
                }

                try {
                    setGuardando(true);

                    const token = await obtenerToken();

                    if (!token) {
                        throw new Error('No hay token de autenticación.');
                    }

                    if (tokenExpirado(token)) {
                        await eliminarToken();
                        throw new Error('Tu sesión ha expirado.');
                    }

                    const datos = {
                        id_usuario: usuarioActual.id_usuario,
                        id_categoria: categoriaSeleccionada,
                        observacion: '',
                        productos: productosCategoria.map(producto => ({
                            id_producto: producto.id_producto
                        }))
                    };

                    console.log('DATOS PARA CREAR INVENTARIO:', datos);

                    const respuesta = await fetch(
                        `${API_URL}/api/inventarios/enviar`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(datos)
                        }
                    );

                    const resultado = await respuesta.json();

                    if (!respuesta.ok) {
                        throw new Error(
                            resultado.detail || 'No se pudo crear el inventario.'
                        );
                    }

                    mostrarMensaje(
                        'Inventario creado correctamente',
                        `Inventario N.º ${resultado.id_inventario}`
                    );

                    router.back();

                } catch (error) {

                    console.error('ERROR CREANDO INVENTARIO:', error);

                    mostrarMensaje(
                        'Error',
                        error instanceof Error
                            ? error.message
                            : 'Error al crear el inventario.'
                    );

                } finally {
                    setGuardando(false);
                }
            };


    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.cargandoTexto}>Cargando información...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
                    
                    {/* ENCABEZADO */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.titulo}>Crear Salida</Text>
                        <Text style={styles.subtitulo}>Registra la salida de inventario para un cliente</Text>
                    </View>

                    <View style={styles.card}>

                    <Text style={styles.seccionTitulo}>
                        1. Seleccionar categoría
                    </Text>

                    <Pressable
                        style={styles.selectorInput}
                        onPress={() => setMostrarCategorias(!mostrarCategorias)}
                    >
                        <Text style={styles.textoSeleccionado}>
                            {categorias.find(
                                c => c.id_categoria === categoriaSeleccionada
                            )?.nombre || 'Seleccionar categoría...'}
                        </Text>

                        <Text>▼</Text>
                    </Pressable>

                   {mostrarCategorias && (
                        <View style={styles.listaDesplegable}>

                            <ScrollView
                                style={{ maxHeight: 200 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                            >
                                {categorias.map(categoria => (
                                    <Pressable
                                        key={categoria.id_categoria}
                                        style={styles.opcion}
                                        onPress={() =>
                                            seleccionarCategoria(categoria.id_categoria)
                                            
                                        }
                                    >
                                        <Text style={styles.nombreOpcion}>
                                            {categoria.nombre}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                        </View>
                    )}

                </View>

                <View style={styles.card}>

                    <Text style={styles.seccionTitulo}>
                        2. Productos encontrados
                    </Text>

                    <Text style={styles.secundario}>
                        Total de productos: {productosCategoria.length}
                    </Text>

                    {productosCategoria.map(producto => (
                        <View
                            key={producto.id_producto}
                            style={styles.productoAgregado}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nombreProductoItem}>
                                    {producto.nombre}
                                </Text>

                                <Text style={styles.secundario}>
                                    Código: {producto.codigo_sm || 'Sin código'}
                                </Text>
                            </View>
                        </View>
                    ))}

                </View>

                <Pressable
                    style={styles.botonGuardar}
                    onPress={crearInventario}
                    disabled={guardando}
                >
                    {guardando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.textoBoton}>
                            CREAR INVENTARIO
                        </Text>
                    )}
                </Pressable>

                    {/* BOTONES FINALES */}
                    <View style={styles.accionesContainer}>

                        <Pressable style={styles.botonCancelar} onPress={() => router.back()} disabled={guardando}>
                            <Text style={styles.textoCancelar}>Cancelar</Text>
                        </Pressable>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    contenedor: {
        padding: 16,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 16,
    },
    titulo: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    subtitulo: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    seccionTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    headerListaProd: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    seccionTitleInline: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    badgeCount: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeCountText: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: '700',
    },
    etiqueta: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 46,
        fontSize: 14,
        color: '#0F172A',
    },
    selectorInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 46,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flechaSelect: {
        fontSize: 10,
        color: '#64748B',
    },
    textoPlaceholder: {
        color: '#94A3B8',
        fontSize: 14,
        flex: 1,
    },
    textoSeleccionado: {
        color: '#0F172A',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    listaDesplegable: {
        marginTop: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        maxHeight: 200,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    opcion: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    nombreOpcion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    nombreProducto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    secundario: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 2,
    },
    filaCantidad: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    botonAgregar: {
        backgroundColor: '#4F46E5',
        height: 46,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoBotonAgregar: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    vacioContenedor: {
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    vacioTexto: {
        fontSize: 13,
        color: '#94A3B8',
    },
    productoAgregado: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    nombreProductoItem: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    detallesItemRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    tagCodigo: {
        fontSize: 12,
        color: '#64748B',
    },
    tagCantidad: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '600',
    },
    btnEliminarContainer: {
        paddingLeft: 12,
        paddingVertical: 6,
    },
    eliminar: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 12,
    },
    accionesContainer: {
        marginTop: 8,
    },
    botonGuardar: {
        backgroundColor: '#0F172A',
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.8,
    },
    botonCancelar: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    textoCancelar: {
        color: '#64748B',
        fontWeight: '600',
        fontSize: 13,
    },
    cargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        gap: 12,
    },
    cargandoTexto: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    }
});