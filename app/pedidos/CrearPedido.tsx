import React, { useEffect, useState } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
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
import { obtenerToken, tokenExpirado, eliminarToken } from '../../constants/auth';
import { API_URL } from '../../constants/api';

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
    nombre: string;
    cantidad: number;
}

export default function CrearPedido() {
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [resultadosProductos, setResultadosProductos] = useState<Producto[]>([]);
    const [mostrarClientes, setMostrarClientes] = useState(false);
    const router = useRouter();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [pedido, setPedido] = useState('');

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

            if (!token) {
                throw new Error('No hay token de autenticación.');
            }

            if (tokenExpirado(token)) {
                await eliminarToken();
                throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
            }

            const [respuestaClientes, respuestaProductos] = await Promise.all([
                fetch(`${API_URL}/api/clientes/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_URL}/api/productos/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (!respuestaClientes.ok) {
                throw new Error(`Error clientes: HTTP ${respuestaClientes.status}`);
            }

            if (!respuestaProductos.ok) {
                throw new Error(`Error productos: HTTP ${respuestaProductos.status}`);
            }

            const datosClientes = await respuestaClientes.json();
            const datosProductos = await respuestaProductos.json();

            setClientes(datosClientes);
            setProductos(datosProductos);

        } catch (error) {
            console.error('ERROR AL CARGAR DATOS:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'No se pudieron cargar clientes y productos.'
            );
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
            const url = `${API_URL}/api/pedidos/buscar?busqueda=${encodeURIComponent(texto)}`;
            const respuesta = await fetch(url);
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
            Alert.alert('Atención', 'Selecciona un producto de la lista.');
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

    const guardarPedido = async () => {
        if (!clienteSeleccionado) {
            mostrarMensaje('Atención', 'Selecciona un cliente.');
            return;
        }

        if (listaProductos.length === 0) {
            mostrarMensaje('Atención', 'Agrega al menos un producto al pedido.');
            return;
        }

        try {
            setGuardando(true);

            const datosPedido = {
                id_cliente: clienteSeleccionado,
                productos: listaProductos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad
                }))
            };

            const respuesta = await fetch(`${API_URL}/api/pedidos/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosPedido)
            });

            const contenido = await respuesta.text();
            const resultado = contenido ? JSON.parse(contenido) : {};

            if (!respuesta.ok) {
                throw new Error(resultado.detail || 'No se pudo crear el pedido.');
            }

            mostrarMensaje(
                'Pedido creado correctamente',
                `Número de pedido: ${resultado.numero_pedido || 'Registrado'}`
            );

            router.back();

        } catch (error: any) {
            console.error('ERROR AL GUARDAR PEDIDO:', error);
            mostrarMensaje('Error', error.message || 'No se pudo registrar el pedido.');
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#0F172A" />
                <Text style={styles.cargandoTexto}>Cargando información...</Text>
            </View>
        );
    }

    const clienteObj = clientes.find(c => c.id_cliente === clienteSeleccionado);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.contenedor} showsVerticalScrollIndicator={false}>
                    
                    {/* ENCABEZADO */}
                    <Text style={styles.titulo}>Crear Pedido</Text>
                    <Text style={styles.subtitulo}>Complete los datos para generar un nuevo pedido</Text>

                    {/* NÚMERO DE PEDIDO */}
                    <Text style={styles.etiqueta}>Nº de Pedido</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. 00123"
                        placeholderTextColor="#94A3B8"
                        value={pedido}
                        keyboardType="numeric"
                        onChangeText={setPedido}
                    />

                    {/* CLIENTE */}
                    <Text style={styles.etiqueta}>Cliente</Text>
                    <Pressable
                        style={styles.selectorInput}
                        onPress={() => setMostrarClientes(!mostrarClientes)}
                    >
                        <Text style={clienteObj ? styles.textoSeleccionado : styles.textoPlaceholder}>
                            {clienteObj 
                                ? `${clienteObj.nombre} ${clienteObj.apellidos || ''} (Doc: ${clienteObj.numero_documento})` 
                                : 'Seleccionar cliente...'}
                        </Text>
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

                    {/* BUScar PRODUCTO */}
                    <Text style={styles.etiqueta}>Buscar Producto</Text>
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
                                        setBusquedaProducto(`${producto.codigo_sm} - ${producto.nombre}`);
                                        setResultadosProductos([]);
                                    }}
                                >
                                    <Text style={styles.nombreProducto}>
                                        {producto.codigo_sm} | {producto.nombre}
                                    </Text>
                                    <Text style={styles.secundario}>
                                        Existencias en stock: {producto.cantidad_fisica}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* CANTIDAD */}
                    <Text style={styles.etiqueta}>Cantidad Solicitada</Text>
                    <TextInput
                        style={styles.input}
                        value={cantidad}
                        onChangeText={setCantidad}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor="#94A3B8"
                    />

                    <Pressable style={styles.botonAgregar} onPress={agregarProducto}>
                        <Text style={styles.textoBotonAgregar}>+ Agregar a la lista</Text>
                    </Pressable>

                    {/* LISTA DE PRODUCTOS AGREGADOS */}
                    <Text style={styles.etiqueta}>Productos del Pedido ({listaProductos.length})</Text>

                    {listaProductos.length === 0 ? (
                        <View style={styles.vacioContenedor}>
                            <Text style={styles.vacioTexto}>No hay productos agregados todavía.</Text>
                        </View>
                    ) : (
                        listaProductos.map((item, indice) => (
                            <View key={indice} style={styles.productoAgregado}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nombreProducto}>{item.nombre}</Text>
                                    <Text style={styles.secundario}>Cantidad: {item.cantidad}</Text>
                                </View>
                                <Pressable onPress={() => eliminarProducto(indice)} style={styles.btnEliminarContainer}>
                                    <Text style={styles.eliminar}>Eliminar</Text>
                                </Pressable>
                            </View>
                        ))
                    )}

                    {/* BOTONES FINALES */}
                    <Pressable
                        style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
                        onPress={guardarPedido}
                        disabled={guardando}
                    >
                        {guardando ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.textoBoton}>GUARDAR PEDIDO</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.botonCancelar} onPress={() => router.back()}>
                        <Text style={styles.textoCancelar}>Cancelar</Text>
                    </Pressable>

                </ScrollView>
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
        padding: 16,
        paddingBottom: 40,
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },
    subtitulo: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
        marginBottom: 16,
    },
    etiqueta: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        marginTop: 12,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        paddingHorizontal: 12,
        height: 40,
        fontSize: 13,
        color: '#0F172A',
    },
    selectorInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        paddingHorizontal: 12,
        height: 40,
        justifyContent: 'center',
    },
    textoPlaceholder: {
        color: '#94A3B8',
        fontSize: 13,
    },
    textoSeleccionado: {
        color: '#0F172A',
        fontSize: 13,
        fontWeight: '500',
    },
    listaDesplegable: {
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        maxHeight: 180,
    },
    opcion: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    nombreOpcion: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    nombreProducto: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    secundario: {
        color: '#64748B',
        fontSize: 11,
        marginTop: 2,
    },
    botonAgregar: {
        backgroundColor: '#0F172A',
        height: 38,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    textoBotonAgregar: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 12,
    },
    vacioContenedor: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    vacioTexto: {
        fontSize: 12,
        color: '#94A3B8',
    },
    productoAgregado: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 6,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    btnEliminarContainer: {
        paddingLeft: 10,
    },
    eliminar: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 12,
    },
    botonGuardar: {
        backgroundColor: '#0F172A',
        height: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
    textoBoton: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    botonCancelar: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    textoCancelar: {
        color: '#64748B',
        fontWeight: '600',
        fontSize: 12,
    },
    cargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        gap: 8,
    },
    cargandoTexto: {
        color: '#64748B',
        fontSize: 12,
    }
});