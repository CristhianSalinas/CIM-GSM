
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

interface Cliente {
    id_cliente: number;
    nombre?: string;
    razon_social?: string;
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

export default function CrearSalida() {

    
    
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [resultadosProductos, setResultadosProductos] = useState<Producto[]>([]);
    const [mostrarClientes, setMostrarClientes] = useState(false);
    const router = useRouter();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);



    const [clienteSeleccionado, setClienteSeleccionado] =
        useState<number | null>(null);

    const [productoSeleccionado, setProductoSeleccionado] =
        useState<Producto | null>(null);

    const [cantidad, setCantidad] = useState('1');

    const [listaProductos, setListaProductos] =
        useState<ProductoSeleccionado[]>([]);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Cargar clientes y productos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);

            const [respuestaClientes, respuestaProductos] =
                await Promise.all([
                    fetch(`${API_URL}/api/clientes/`),
                    fetch(`${API_URL}/api/productos/`)
                ]);

            if (!respuestaClientes.ok || !respuestaProductos.ok) {
                throw new Error('No se pudieron cargar los datos.');
            }

            const datosClientes = await respuestaClientes.json();
            const datosProductos = await respuestaProductos.json();

            setClientes(datosClientes);
            setProductos(datosProductos);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudieron cargar clientes y productos.');
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

        console.log('URL CONSULTADA:', url);

        const respuesta = await fetch(url);

        const contenido = await respuesta.text();

        console.log('ESTADO HTTP:', respuesta.status);
        console.log('RESPUESTA API:', contenido);

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status}: ${contenido}`
            );
        }

        const datos = JSON.parse(contenido);
        setResultadosProductos(datos);

    } catch (error) {
        console.error('ERROR BUSCANDO PRODUCTOS:', error);
        setResultadosProductos([]);
    }
};

    // Agregar producto a la lista
    const agregarProducto = () => {

        if (!productoSeleccionado) {
            Alert.alert('Atención', 'Selecciona un producto.');
            return;
        }

        const cantidadNumerica = Number(cantidad);

        if (
            !Number.isInteger(cantidadNumerica) ||
            cantidadNumerica <= 0
        ) {
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
        setCantidad('1');
    };

    // Eliminar producto de la lista
    const eliminarProducto = (indice: number) => {
        setListaProductos(actual =>
            actual.filter((_, i) => i !== indice)
        );
    };

    // Guardar pedido
   
const guardarSalida = async () => {

        if (!clienteSeleccionado) {
            mostrarMensaje('Atención', 'Selecciona un cliente.');
            return;
        }

        if (listaProductos.length === 0) {
            mostrarMensaje('Atención', 'Agrega al menos un producto.');
            return;
        }

        try {
            setGuardando(true);

            const datosSalida = {
                id_cliente: clienteSeleccionado,
                productos: listaProductos.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad
                }))
            };

            console.log('DATOS ENVIADOS:', datosSalida);

            const respuesta = await fetch(
                `${API_URL}/api/pedidos/crear-salida`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosSalida)
                }
            );

            const contenido = await respuesta.text();

            console.log('ESTADO HTTP:', respuesta.status);
            console.log('RESPUESTA:', contenido);

            const resultado = contenido ? JSON.parse(contenido) : {};

            if (!respuesta.ok) {
                throw new Error(
                    resultado.detail || 'No se pudo crear la salida.'
                );
            }

            mostrarMensaje(
                'Salida creada correctamente',
                `Número de pedido: ${resultado.numero_pedido}`
            );

            router.back();

        } catch (error: any) {

            console.error('ERROR AL GUARDAR SALIDA:', error);

            mostrarMensaje(
                'Error',
                error.message || 'No se pudo registrar la salida.'
            );

        } finally {
            setGuardando(false);
        }
    };


    if (cargando) {
        return (
            <View style={styles.cargando}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text>Cargando información...</Text>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                        <ScrollView style={styles.contenedor}>

                            <Text style={styles.titulo}>Crear pedido</Text>

                            <Text style={styles.etiqueta}>Cliente</Text>

                                    <Pressable
                                        style={styles.input}
                                        onPress={() => setMostrarClientes(!mostrarClientes)}
                                    >
                                        <Text>
                                            {clientes.find(c => c.id_cliente === clienteSeleccionado)?.razon_social ||
                                            clientes.find(c => c.id_cliente === clienteSeleccionado)?.nombre ||
                                            'Seleccionar cliente'}
                                        </Text>
                                    </Pressable>

                                    {mostrarClientes && clientes.map(cliente => (
                                        <Pressable
                                            key={cliente.id_cliente}
                                            style={styles.opcion}
                                            onPress={() => {
                                                setClienteSeleccionado(cliente.id_cliente);
                                                setMostrarClientes(false);
                                            }}
                                        >
                                            <Text>
                                                {cliente.razon_social || cliente.nombre ||
                                                `Cliente ${cliente.id_cliente}`}
                                            </Text>
                                        </Pressable>
                                    ))}

                            {/* Seleccionar producto */}
                            <Text style={styles.etiqueta}>Buscar producto</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Buscar por código SM o nombre"
                                    value={busquedaProducto}
                                    onChangeText={buscarProductos}
                                />

                                {resultadosProductos.map(producto => (
                                    <Pressable
                                        key={producto.id_producto}
                                        style={styles.opcion}
                                        onPress={() => {
                                            setProductoSeleccionado(producto);
                                            setBusquedaProducto(
                                                `${producto.codigo_sm} - ${producto.nombre}`
                                            );
                                            setResultadosProductos([]);
                                        }}
                                    >
                                        <Text style={styles.nombreProducto}>
                                            {producto.codigo_sm} - {producto.nombre}
                                        </Text>
                                        <Text style={styles.secundario}>
                                            Existencias: {producto.cantidad_fisica}
                                        </Text>
                                    </Pressable>
                                ))}

                            {/* Cantidad */}
                            <Text style={styles.etiqueta}>Cantidad solicitada</Text>

                            <TextInput
                                style={styles.input}
                                value={cantidad}
                                onChangeText={setCantidad}
                                keyboardType="numeric"
                                placeholder="Ingrese la cantidad"
                            />

                            <Pressable
                                style={styles.botonAgregar}
                                onPress={agregarProducto}
                            >
                                <Text style={styles.textoBoton}>
                                    + Agregar producto
                                </Text>
                            </Pressable>

                            {/* Lista de productos */}
                            <Text style={styles.etiqueta}>Productos del pedido</Text>

                            {listaProductos.map((item, indice) => (
                                <View key={indice} style={styles.productoAgregado}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.nombreProducto}>
                                            {item.nombre}
                                        </Text>
                                        <Text style={styles.secundario}>
                                            Cantidad: {item.cantidad}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => eliminarProducto(indice)}
                                    >
                                        <Text style={styles.eliminar}>Eliminar</Text>
                                    </Pressable>
                                </View>
                            ))}

                            {/* Guardar */}
                            <Pressable
                                style={[
                                    styles.botonGuardar,
                                    guardando && { opacity: 0.6 }
                                ]}
                                onPress={guardarSalida}
                                disabled={guardando}
                            >
                                <Text style={styles.textoBoton}>
                                    {guardando ? 'Guardando...' : 'Guardar pedido'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.botonCancelar}
                                onPress={() => router.back()}
                            >
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
    backgroundColor: '#F9FAFB',
    },
    contenedor: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        padding: 16
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#172033'
    },

    etiqueta: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 10,
        color: '#172033'
    },

    opcion: {
        backgroundColor: '#fff',
        padding: 13,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd'
    },

    seleccionado: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff'
    },

    nombreProducto: {
        fontWeight: '600',
        color: '#172033'
    },

    secundario: {
        color: '#666',
        fontSize: 13,
        marginTop: 4
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },

    botonAgregar: {
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12
    },

    productoAgregado: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 13,
        borderRadius: 8,
        marginBottom: 8
    },

    eliminar: {
        color: '#dc2626',
        fontWeight: 'bold'
    },

    botonGuardar: {
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 25
    },

    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },

    botonCancelar: {
        padding: 14,
        alignItems: 'center',
        marginBottom: 30
    },

    textoCancelar: {
        color: '#555',
        fontWeight: '600'
    },

    cargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    }
});
