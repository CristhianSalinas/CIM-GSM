import React, { useEffect, useState } from 'react';
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
import { API_URL } from '../../constants/api';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { obtenerToken, tokenExpirado, eliminarToken } from '../../constants/auth';

interface Cliente {
    id_cliente: number;
    id_tipo_documento: string;
    numero_documento: string;
    nombre: string;
    apellidos: string;
    direccion: string;
    telefono: string;
}

interface Producto {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    cantidad_fisica: number;
}

interface ProductoSeleccionado {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    cantidad: number;
}

export default function CrearSalida() {
    const router = useRouter();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [resultadosProductos, setResultadosProductos] = useState<Producto[]>([]);
    const [mostrarClientes, setMostrarClientes] = useState(false);

    const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState('1');
    const [listaProductos, setListaProductos] = useState<ProductoSeleccionado[]>([]);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = await obtenerToken();

            if (!token) throw new Error('No hay token de autenticación.');
            if (tokenExpirado(token)) {
                await eliminarToken();
                throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
            }

            const [respuestaClientes, respuestaProductos] = await Promise.all([
                fetch(`${API_URL}/api/clientes/`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                }),
                fetch(`${API_URL}/api/productos/`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                })
            ]);

            if (!respuestaClientes.ok) throw new Error(`Error clientes: HTTP ${respuestaClientes.status}`);
            if (!respuestaProductos.ok) throw new Error(`Error productos: HTTP ${respuestaProductos.status}`);

            setClientes(await respuestaClientes.json());
            setProductos(await respuestaProductos.json());
        } catch (error) {
            console.error('ERROR AL CARGAR DATOS:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudieron cargar datos.');
        } finally {
            setCargando(false);
        }
    };

    const mostrarMensaje = (titulo: string, mensaje: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensaje}`);
        } else {
            Alert.alert(titulo, mensaje);
        }
    };

    const buscarProductos = async (texto: string) => {
        setBusquedaProducto(texto);

        if (texto.trim().length < 2) {
            setResultadosProductos([]);
            return;
        }

        try {
            const token = await obtenerToken();
            const url = `${API_URL}/api/pedidos/buscar?busqueda=${encodeURIComponent(texto)}`;
            const respuesta = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const contenido = await respuesta.text();

            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}: ${contenido}`);
            }

            const datos = JSON.parse(contenido);
            setResultadosProductos(datos);
        } catch (error) {
            console.error('ERROR BUSCANDO PRODUCTOS:', error);
            setResultadosProductos([]);
        }
    };

    const agregarProducto = () => {
        if (!productoSeleccionado) {
            Alert.alert('Atención', 'Selecciona un producto de la lista desplegable.');
            return;
        }

        const cantidadNumerica = Number(cantidad);

        if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
            Alert.alert('Atención', 'Ingresa una cantidad entera mayor que cero.');
            return;
        }

        setListaProductos(actual => [
            ...actual,
            {
                id_producto: productoSeleccionado.id_producto,
                codigo_sm: productoSeleccionado.codigo_sm,
                nombre: productoSeleccionado.nombre,
                cantidad: cantidadNumerica
            }
        ]);

        setProductoSeleccionado(null);
        setBusquedaProducto('');
        setCantidad('1');
    };

    const eliminarProducto = (indice: number) => {
        setListaProductos(actual => actual.filter((_, i) => i !== indice));
    };

    const guardarSalida = async () => {
        if (!clienteSeleccionado) {
            mostrarMensaje('Atención', 'Selecciona un cliente.');
            return;
        }

        if (listaProductos.length === 0) {
            mostrarMensaje('Atención', 'Agrega al menos un producto a la salida.');
            return;
        }

        try {
            setGuardando(true);
            const token = await obtenerToken();

            const datosSalida = {
                id_cliente: clienteSeleccionado,
                productos: listaProductos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad
                }))
            };

            const respuesta = await fetch(`${API_URL}/api/pedidos/crear-salida`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosSalida)
            });

            const contenido = await respuesta.text();
            const resultado = contenido ? JSON.parse(contenido) : {};

            if (!respuesta.ok) {
                throw new Error(resultado.detail || 'No se pudo crear la salida.');
            }

            mostrarMensaje(
                'Salida creada correctamente',
                `Número de pedido: ${resultado.numero_pedido || 'Registrado'}`
            );

            router.back();
        } catch (error: any) {
            console.error('ERROR AL GUARDAR SALIDA:', error);
            mostrarMensaje('Error', error.message || 'No se pudo registrar la salida.');
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

    const clienteObj = clientes.find(c => c.id_cliente === clienteSeleccionado);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
                    
                    {/* ENCABEZADO */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.titulo}>Crear Salida</Text>
                        <Text style={styles.subtitulo}>Registra la salida de inventario para un cliente</Text>
                    </View>

                    {/* SECCIÓN CLIENTE */}
                    <View style={styles.card}>
                        <Text style={styles.seccionTitulo}>1. Seleccionar Cliente</Text>
                        <Text style={styles.etiqueta}>Cliente</Text>
                        
                        <Pressable
                            style={styles.selectorInput}
                            onPress={() => setMostrarClientes(!mostrarClientes)}
                        >
                            <Text style={clienteObj ? styles.textoSeleccionado : styles.textoPlaceholder} numberOfLines={1}>
                                {clienteObj 
                                    ? `${clienteObj.nombre} ${clienteObj.apellidos || ''} (Doc: ${clienteObj.numero_documento})` 
                                    : 'Seleccionar cliente...'}
                            </Text>
                            <Text style={styles.flechaSelect}>▼</Text>
                        </Pressable>

                        {mostrarClientes && (
                            <View style={styles.listaDesplegable}>
                                {clientes.map(cliente => (
                                    <Pressable
                                        key={cliente.id_cliente}
                                        style={styles.opcion}
                                        onPress={() => {
                                            setClienteSeleccionado(cliente.id_cliente);
                                            setMostrarClientes(false);
                                        }}
                                    >
                                        <Text style={styles.nombreOpcion}>
                                            {cliente.nombre} {cliente.apellidos}
                                        </Text>
                                        <Text style={styles.secundario}>Doc: {cliente.numero_documento}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* SECCIÓN PRODUCTOS */}
                    <View style={styles.card}>
                        <Text style={styles.seccionTitulo}>2. Añadir Productos</Text>

                        <Text style={styles.etiqueta}>Buscar producto</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar por código SM o nombre"
                            placeholderTextColor="#94A3B8"
                            value={busquedaProducto}
                            onChangeText={buscarProductos}
                        />

                        {resultadosProductos.length > 0 && (
                            <View style={styles.listaDesplegable}>
                                {resultadosProductos.map(producto => (
                                    <Pressable
                                        key={producto.id_producto}
                                        style={styles.opcion}
                                        onPress={() => {
                                            setProductoSeleccionado(producto);
                                            setBusquedaProducto(`${producto.codigo_sm || ''} - ${producto.nombre}`);
                                            setResultadosProductos([]);
                                        }}
                                    >
                                        <Text style={styles.nombreProducto}>
                                            {producto.codigo_sm ? `${producto.codigo_sm} | ` : ''}{producto.nombre}
                                        </Text>
                                        <Text style={styles.secundario}>
                                            Existencias: {producto.cantidad_fisica}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Text style={styles.etiqueta}>Cantidad solicitada</Text>
                        <View style={styles.filaCantidad}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={cantidad}
                                onChangeText={setCantidad}
                                keyboardType="numeric"
                                placeholder="1"
                                placeholderTextColor="#94A3B8"
                            />
                            <Pressable style={styles.botonAgregar} onPress={agregarProducto}>
                                <Text style={styles.textoBotonAgregar}>+ Agregar</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* LISTA DE PRODUCTOS SELECCIONADOS */}
                    <View style={styles.card}>
                        <View style={styles.headerListaProd}>
                            <Text style={styles.seccionTitleInline}>Productos de la salida</Text>
                            <View style={styles.badgeCount}>
                                <Text style={styles.badgeCountText}>{listaProductos.length}</Text>
                            </View>
                        </View>

                        {listaProductos.length === 0 ? (
                            <View style={styles.vacioContenedor}>
                                <Text style={styles.vacioTexto}>No hay productos agregados todavía.</Text>
                            </View>
                        ) : (
                            listaProductos.map((item, indice) => (
                                <View key={indice} style={styles.productoAgregado}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.nombreProductoItem} numberOfLines={1}>{item.nombre}</Text>
                                        <View style={styles.detallesItemRow}>
                                            {item.codigo_sm && <Text style={styles.tagCodigo}>Código: {item.codigo_sm}</Text>}
                                            <Text style={styles.tagCantidad}>Cant: {item.cantidad}</Text>
                                        </View>
                                    </View>
                                    <Pressable onPress={() => eliminarProducto(indice)} style={styles.btnEliminarContainer}>
                                        <Text style={styles.eliminar}>Eliminar</Text>
                                    </Pressable>
                                </View>
                            ))
                        )}
                    </View>

                    {/* BOTONES FINALES */}
                    <View style={styles.accionesContainer}>
                        <Pressable
                            style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
                            onPress={guardarSalida}
                            disabled={guardando}
                        >
                            {guardando ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.textoBoton}>GUARDAR SALIDA</Text>
                            )}
                        </Pressable>

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