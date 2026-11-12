import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Modal,
    useWindowDimensions,
    Platform
} from 'react-native';




import { router } from 'expo-router';
import { eliminarToken } from '../../../constants/auth';
import { useEffect, useState } from 'react';
import BotonInicio from '../../../componentes/botones/boton_inicio';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { API_URL } from '../../../constants/api';
import { obtenerToken } from '../../../constants/auth';

const cerrarSesion = async () => {
    await eliminarToken();
    router.replace('/login');
};

interface Producto {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_marca: number;
    referencia: string;
    descripcion: string;
    precio: number;
    cantidad_fisica: number;
}

interface Estadisticas {
    total_productos: number;
    Stock_Bajo: number;
    Agotados: number;
}

export default function Conteo() {

    // RESPONSIVE
    const { width } = useWindowDimensions();

    const esWeb = Platform.OS === 'web';
    const esPantallaGrande = esWeb && width >= 768;


    // ESTADOS
    const [productos, setProductos] = useState<Producto[]>([]);
    const [busqueda, setBusqueda] = useState('');

    const [estadisticas, setEstadisticas] = useState<Estadisticas>({
        total_productos: 0,
        Stock_Bajo: 0,
        Agotados: 0
    });

    const [productoSeleccionado, setProductoSeleccionado] =
        useState<Producto | null>(null);

    const [nuevoConteo, setNuevoConteo] = useState('');

    const [filtroStock, setFiltroStock] =
        useState<'todos' | 'bajo' | 'agotados'>('todos');

    // CARGAR PRODUCTOS

   
    // CARGAR PRODUCTOS
    const cargarProductos = async () => {
        try {
            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay sesión activa. Inicia sesión nuevamente.');
                
            }

            const respuesta = await fetch(`${API_URL}/api/productos/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const datos = await respuesta.json();
            setProductos(datos);

        } catch (error) {
            console.log('Error al cargar productos:', error);
        }
    };

    const cargarEstadisticas = async () => {
    try {
        const token = await obtenerToken();

        if (!token) {
            throw new Error('No hay token de autenticación.');
        }

        const respuesta = await fetch(
            `${API_URL}/api/productos/estadisticas`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        setEstadisticas(datos);

    } catch (error) {
        console.log('Error al cargar estadísticas:', error);
    }
};

    // REGISTRAR CONTEO
    const enviarInventario = async () => {

        if (!productoSeleccionado) {
            alert('Selecciona un producto.');
            return;
        }

        if (
            nuevoConteo.trim() === '' ||
            !Number.isInteger(Number(nuevoConteo)) ||
            Number(nuevoConteo) < 0
        ) {
            alert('Ingresa una cantidad válida.');
            return;
        }

        try {

            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay token de autenticación.');
            }

            const respuesta = await fetch(
                `${API_URL}/api/inventarios/enviar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_usuario: 1,
                        id_ubicacion: 1,
                        id_producto: productoSeleccionado.id_producto,
                        cantidad_contada: Number(nuevoConteo),
                        observacion: 'Conteo físico'
                    })
                }
            );

            if (!respuesta.ok) {
                const error = await respuesta.json();
                throw new Error(JSON.stringify(error));
            }

            await respuesta.json();

            await cargarProductos();
            await cargarEstadisticas();

            setProductoSeleccionado(null);
            setNuevoConteo('');

            alert('Inventario registrado correctamente.');

           

        } catch (error) {
            console.log('Error al registrar inventario:', error);
            alert('No se pudo registrar el inventario.');
        }
    };

    // ESTADO DEL STOCK
    const obtenerEstadoStock = (cantidad: number) => {

        if (cantidad <= 0) {
            return {
                texto: 'Agotado',
                color: '#B91C1C',
                fondo: '#FEF2F2'
            };
        }

        if (cantidad <= 3) {
            return {
                texto: 'Stock bajo',
                color: '#A16207',
                fondo: '#FEFCE8'
            };
        }

        return {
            texto: 'Disponible',
            color: '#15803D',
            fondo: '#F0FDF4'
        };
    };

    // FILTRAR PRODUCTOS
    const productosFiltrados = productos.filter((producto) => {

        const texto = busqueda.toLowerCase().trim();

        const coincideBusqueda =
            (producto.nombre || '').toLowerCase().includes(texto) ||
            (producto.codigo_sm || '').toLowerCase().includes(texto) ||
            (producto.referencia || '').toLowerCase().includes(texto);

        const coincideStock =
            filtroStock === 'todos' ||
            (
                filtroStock === 'bajo' &&
                producto.cantidad_fisica > 0 &&
                producto.cantidad_fisica <= 3
            ) ||
            (
                filtroStock === 'agotados' &&
                producto.cantidad_fisica <= 0
            );

        return coincideBusqueda && coincideStock;
    });

    // CARGA INICIAL
    useEffect(() => {
        cargarProductos();
        cargarEstadisticas();
    }, []);

    // ESTILOS DINÁMICOS
    const estilos = {
        container: [
            styles.container,
            esWeb && styles.containerWeb
        ],

        contenido: [
            styles.contenido,
            esPantallaGrande && styles.contenidoWeb
        ],

        cards: [
            styles.cards,
            !esPantallaGrande && styles.cardsMovil
        ],

        card: [
            styles.card,
            !esPantallaGrande && styles.cardMovil
        ],

        modalContenido: [
            styles.modalContenido,
            esWeb && styles.modalWeb
        ]
    };

    return (
<SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
                <View style={estilos.container}>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >

                        <View style={estilos.contenido}>

                            {/* NAVEGACIÓN */}

                            <View style={styles.navegacion}>
                                <BotonInicio />
                            </View>

                            {/* ENCABEZADO */}

                            <View style={styles.header}>

                                <View>
                                    <Text style={styles.title}>
                                        Conteo físico
                                    </Text>

                                    <Text style={styles.subtitle}>
                                        Control y verificación de existencias del inventario.
                                    </Text>
                                </View>

                                <View style={styles.headerBadge}>
                                    <View style={styles.headerDot} />
                                    <Text style={styles.headerBadgeText}>
                                        INVENTARIO
                                    </Text>
                                </View>

                            </View>

                            {/* ESTADÍSTICAS */}

                            <View style={estilos.cards}>

                                <View style={estilos.card}>
                                    <Text style={styles.cardLabel}>
                                        TOTAL PRODUCTOS
                                    </Text>

                                    <Text style={styles.number}>
                                        {estadisticas.total_productos}
                                    </Text>

                                    <Text style={styles.cardDescription}>
                                        Productos registrados
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        estilos.card,
                                        filtroStock === 'bajo' && styles.cardActiva
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setFiltroStock(
                                            filtroStock === 'bajo' ? 'todos' : 'bajo'
                                        )
                                    }
                                >
                                    <Text style={styles.cardLabel}>
                                        STOCK BAJO
                                    </Text>

                                    <Text style={[styles.number, styles.numberWarning]}>
                                        {estadisticas.Stock_Bajo}
                                    </Text>

                                    <Text style={styles.cardDescription}>
                                        Requieren atención
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        estilos.card,
                                        filtroStock === 'agotados' && styles.cardActiva
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setFiltroStock(
                                            filtroStock === 'agotados' ? 'todos' : 'agotados'
                                        )
                                    }
                                >
                                    <Text style={styles.cardLabel}>
                                        AGOTADOS
                                    </Text>

                                    <Text style={[styles.number, styles.numberDanger]}>
                                        {estadisticas.Agotados}
                                    </Text>

                                    <Text style={styles.cardDescription}>
                                        Sin existencias
                                    </Text>
                                </TouchableOpacity>

                            </View>

                            {/* CONTENIDO PRINCIPAL */}

                            <View style={styles.panel}>

                                <View style={styles.panelHeader}>

                                    <View>
                                        <Text style={styles.sectionTitle}>
                                            Inventario de productos
                                        </Text>

                                        <Text style={styles.sectionSubtitle}>
                                            Selecciona un producto para realizar el conteo.
                                        </Text>
                                    </View>

                                    <View style={styles.totalBadge}>
                                        <Text style={styles.totalBadgeText}>
                                            {productosFiltrados.length} productos
                                        </Text>
                                    </View>

                                </View>

                                {/* BUSCADOR */}

                                <View style={styles.searchContainer}>

                                    <Text style={styles.searchIcon}>
                                        ⌕
                                    </Text>

                                    <TextInput
                                        style={styles.busqueda}
                                        placeholder="Buscar por nombre, código o referencia..."
                                        placeholderTextColor="#9CA3AF"
                                        value={busqueda}
                                        onChangeText={setBusqueda}
                                    />

                                    {busqueda.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setBusqueda('')}
                                        >
                                            <Text style={styles.clearSearch}>
                                                ✕
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                </View>

                                {/* FILTROS */}

                                <View style={styles.filterContainer}>

                                    {[
                                        { valor: 'todos', texto: 'Todos' },
                                        { valor: 'bajo', texto: 'Stock bajo' },
                                        { valor: 'agotados', texto: 'Agotados' }
                                    ].map((filtro) => (

                                        <TouchableOpacity
                                            key={filtro.valor}
                                            style={[
                                                styles.filterButton,
                                                filtroStock === filtro.valor &&
                                                styles.filterActive
                                            ]}
                                            onPress={() =>
                                                setFiltroStock(
                                                    filtro.valor as 'todos' | 'bajo' | 'agotados'
                                                )
                                            }
                                        >
                                            <Text style={[
                                                styles.filterText,
                                                filtroStock === filtro.valor &&
                                                styles.filterTextActive
                                            ]}>
                                                {filtro.texto}
                                            </Text>
                                        </TouchableOpacity>

                                    ))}

                                </View>

                                {/* TABLA WEB */}

                                {esPantallaGrande && (

                                    <View style={styles.tableHeader}>

                                        <Text style={[styles.columnHeader, styles.colProducto]}>
                                            PRODUCTO
                                        </Text>

                                        <Text style={[styles.columnHeader, styles.colCodigo]}>
                                            CÓDIGO
                                        </Text>

                                        <Text style={[styles.columnHeader, styles.colReferencia]}>
                                            REFERENCIA
                                        </Text>

                                        <Text style={[styles.columnHeader, styles.colStock]}>
                                            EXISTENCIAS
                                        </Text>

                                        <Text style={[styles.columnHeader, styles.colEstado]}>
                                            ESTADO
                                        </Text>

                                    </View>

                                )}

                                {/* LISTADO DE PRODUCTOS */}

                                {productosFiltrados.map((item) => {

                                    const estado = obtenerEstadoStock(
                                        item.cantidad_fisica
                                    );

                                    return (

                                        <TouchableOpacity
                                            key={item.id_producto}
                                            style={[
                                                styles.product,
                                                esPantallaGrande && styles.productWeb
                                            ]}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setProductoSeleccionado(item);
                                                setNuevoConteo(
                                                    String(item.cantidad_fisica ?? 0)
                                                );
                                            }}
                                        >

                                            <View style={[
                                                styles.productInfo,
                                                esPantallaGrande && styles.colProducto
                                            ]}>

                                                <Text style={styles.name}>
                                                    {item.nombre}
                                                </Text>

                                                {!esPantallaGrande && (
                                                    <Text style={styles.category}>
                                                        Código: {item.codigo_sm}
                                                    </Text>
                                                )}

                                            </View>

                                            {esPantallaGrande && (

                                                <>
                                                    <Text style={[styles.webCell, styles.colCodigo]}>
                                                        {item.codigo_sm}
                                                    </Text>

                                                    <Text style={[styles.webCell, styles.colReferencia]}>
                                                        {item.referencia || '—'}
                                                    </Text>
                                                </>

                                            )}

                                            <View style={[
                                                styles.stockContainer,
                                                esPantallaGrande && styles.colStock
                                            ]}>

                                                <Text style={styles.stock}>
                                                    {item.cantidad_fisica}
                                                </Text>

                                                {!esPantallaGrande && (
                                                    <Text style={styles.stockLabel}>
                                                        Unidades
                                                    </Text>
                                                )}

                                            </View>

                                            <View style={[
                                                styles.statusContainer,
                                                esPantallaGrande && styles.colEstado
                                            ]}>

                                                <View style={[
                                                    styles.statusBadge,
                                                    { backgroundColor: estado.fondo }
                                                ]}>
                                                    <Text style={[
                                                        styles.statusText,
                                                        { color: estado.color }
                                                    ]}>
                                                        {estado.texto}
                                                    </Text>
                                                </View>

                                                {!esPantallaGrande && (
                                                    <Text style={styles.actionHint}>
                                                        Tocar para contar
                                                    </Text>
                                                )}

                                            </View>

                                        </TouchableOpacity>

                                    );

                                })}

                                {/* SIN RESULTADOS */}

                                {productosFiltrados.length === 0 && (

                                    <View style={styles.emptyContainer}>

                                        <Text style={styles.emptyIcon}>
                                            —
                                        </Text>

                                        <Text style={styles.emptyTitle}>
                                            No se encontraron productos
                                        </Text>

                                        <Text style={styles.emptyText}>
                                            Intenta cambiar los filtros o los términos de búsqueda.
                                        </Text>

                                    </View>

                                )}

                                {/* PIE DE TABLA */}

                                <View style={styles.panelFooter}>
                                    <Text style={styles.footerText}>
                                        CIM · Control de Inventarios y Movimientos
                                    </Text>
                                </View>

                            </View>

                        </View>

                    </ScrollView>

                    {/* MODAL DE CONTEO */}

                    <Modal
                        visible={productoSeleccionado !== null}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setProductoSeleccionado(null)}
                    >

                        <View style={styles.modalFondo}>

                            <View style={estilos.modalContenido}>

                                <View style={styles.modalHeader}>

                                    <View>
                                        <Text style={styles.modalTitulo}>
                                            Registrar conteo
                                        </Text>

                                        <Text style={styles.modalSubtitle}>
                                            Verificación de existencias físicas
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setProductoSeleccionado(null)}
                                    >
                                        <Text style={styles.closeButtonText}>
                                            ✕
                                        </Text>
                                    </TouchableOpacity>

                                </View>

                                <View style={styles.modalProduct}>

                                    <Text style={styles.modalNombre}>
                                        {productoSeleccionado?.nombre}
                                    </Text>

                                    <Text style={styles.category}>
                                        Código: {productoSeleccionado?.codigo_sm}
                                    </Text>

                                </View>

                                <Text style={styles.inputLabel}>
                                    EXISTENCIAS REGISTRADAS
                                </Text>

                                <View style={styles.currentStock}>

                                    <Text style={styles.currentStockNumber}>
                                        {productoSeleccionado?.cantidad_fisica}
                                    </Text>

                                    <Text style={styles.currentStockText}>
                                        Unidades registradas en el sistema
                                    </Text>

                                </View>

                                <Text style={styles.inputLabel}>
                                    NUEVA CANTIDAD CONTADA
                                </Text>

                                <TextInput
                                    style={styles.countInput}
                                    value={nuevoConteo}
                                    onChangeText={setNuevoConteo}
                                    keyboardType="number-pad"
                                    placeholder="Ingresa la cantidad encontrada"
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text style={styles.helperText}>
                                    Introduce la cantidad real encontrada físicamente.
                                </Text>

                                <TouchableOpacity
                                    style={styles.botonGuardar}
                                    activeOpacity={0.8}
                                    onPress={enviarInventario}
                                >
                                    <Text style={styles.textoBoton}>
                                        Confirmar conteo
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.botonCancelar}
                                    onPress={() => setProductoSeleccionado(null)}
                                >
                                    <Text style={styles.textoCancelar}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>

                            </View>

                        </View>

                    </Modal>

                </View>
        </SafeAreaView>
    </SafeAreaProvider>
    );
}


// ==========================================
// ESTILOS RESPONSIVE CIM
// ==========================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    },

    container: {
        flex: 1,
        backgroundColor: '#F3F5F9',
        paddingHorizontal: 16
    },

    containerWeb: {
        paddingHorizontal: 32
    },

    scrollContent: {
        paddingBottom: 40
    },

    contenido: {
        width: '100%',
        alignSelf: 'center'
    },

    contenidoWeb: {
        maxWidth: 1350
    },

    navegacion: {
        marginTop: 12,
        marginBottom: 12
    },

    // ENCABEZADO

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
        marginBottom: 26
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#172033',
        letterSpacing: -0.6
    },

    subtitle: {
        fontSize: 13,
        color: '#778196',
        marginTop: 6
    },

    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8EEF9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 7,
        gap: 7
    },

    headerDot: {
        width: 7,
        height: 7,
        borderRadius: 10,
        backgroundColor: '#2563EB'
    },

    headerBadgeText: {
        color: '#1E40AF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.6
    },

    // ESTADÍSTICAS

    cards: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 26
    },

    cardsMovil: {
        gap: 8
    },

    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E9F0',
        minWidth: 0,
        elevation: 1,
        shadowColor: '#172033',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5
    },

    cardMovil: {
        paddingHorizontal: 10,
        paddingVertical: 15
    },

    cardActiva: {
        borderColor: '#2563EB',
        backgroundColor: '#F0F5FF'
    },

    cardLabel: {
        fontSize: 10,
        color: '#8490A3',
        fontWeight: '800',
        letterSpacing: 0.5
    },

    number: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1E40AF',
        marginTop: 10
    },

    numberWarning: {
        color: '#D97706'
    },

    numberDanger: {
        color: '#DC2626'
    },

    cardDescription: {
        fontSize: 10,
        color: '#9AA3B2',
        marginTop: 5
    },

    // PANEL

    panel: {
        backgroundColor: '#FFFFFF',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E5E9F0',
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#172033',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5
    },

    panelHeader: {
        paddingHorizontal: 22,
        paddingTop: 23,
        paddingBottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#172033'
    },

    sectionSubtitle: {
        fontSize: 12,
        color: '#8490A3',
        marginTop: 5
    },

    totalBadge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 7
    },

    totalBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#475569'
    },

    // BUSCADOR

    searchContainer: {
        marginHorizontal: 22,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 9,
        paddingHorizontal: 13
    },

    searchIcon: {
        fontSize: 23,
        color: '#94A3B8',
        marginRight: 8
    },

    busqueda: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 13,
        color: '#172033',
        outlineStyle: 'none' as any
    },

    clearSearch: {
        fontSize: 17,
        color: '#94A3B8',
        padding: 5
    },

    // FILTROS

    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 22,
        marginBottom: 20,
        flexWrap: 'wrap'
    },

    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 9,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF'
    },

    filterActive: {
        backgroundColor: '#1E3A8A',
        borderColor: '#1E3A8A'
    },

    filterText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B'
    },

    filterTextActive: {
        color: '#FFFFFF'
    },

    // TABLA WEB

    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E8EDF3',
        paddingVertical: 15,
        paddingHorizontal: 22
    },

    columnHeader: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '800',
        letterSpacing: 0.5
    },

    colProducto: {
        flex: 2.5,
        minWidth: 120
    },

    colCodigo: {
        flex: 1.2
    },

    colReferencia: {
        flex: 1.3
    },

    colStock: {
        flex: 0.8,
        alignItems: 'center'
    },

    colEstado: {
        flex: 1.1,
        alignItems: 'flex-start'
    },

    // PRODUCTOS

    product: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
        gap: 8
    },

    productWeb: {
        paddingHorizontal: 22,
        paddingVertical: 17
    },

    productInfo: {
        flex: 1
    },

    name: {
        fontSize: 13,
        fontWeight: '700',
        color: '#243044'
    },

    category: {
        fontSize: 11,
        color: '#8490A3',
        marginTop: 5
    },

    webCell: {
        fontSize: 12,
        color: '#64748B'
    },

    stockContainer: {
        alignItems: 'flex-end',
        minWidth: 55
    },

    stock: {
        fontSize: 19,
        fontWeight: '800',
        color: '#172033',
        textAlign: 'right'
    },

    stockLabel: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 3
    },

    statusContainer: {
        alignItems: 'flex-end',
        minWidth: 75
    },

    statusBadge: {
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 5
    },

    statusText: {
        fontSize: 10,
        fontWeight: '700'
    },

    actionHint: {
        fontSize: 9,
        color: '#94A3B8',
        marginTop: 5
    },

    // SIN RESULTADOS

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 45,
        paddingHorizontal: 20
    },

    emptyIcon: {
        fontSize: 35,
        color: '#CBD5E1',
        marginBottom: 10
    },

    emptyTitle: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '700'
    },

    emptyText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 7
    },

    panelFooter: {
        backgroundColor: '#FAFBFC',
        borderTopWidth: 1,
        borderTopColor: '#EDF0F4',
        padding: 13,
        alignItems: 'center'
    },

    footerText: {
        fontSize: 10,
        color: '#9AA3B2'
    },

    // MODAL

    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.60)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18
    },

    modalContenido: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: 440,
        padding: 24,
        borderRadius: 14,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 12
    },

    modalWeb: {
        maxWidth: 480
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 22
    },

    modalTitulo: {
        fontSize: 21,
        fontWeight: '800',
        color: '#172033'
    },

    modalSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 5
    },

    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 7,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center'
    },

    closeButtonText: {
        fontSize: 15,
        color: '#64748B'
    },

    modalProduct: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E8EDF3',
        borderRadius: 9,
        padding: 14,
        marginBottom: 22
    },

    modalNombre: {
        fontSize: 15,
        fontWeight: '700',
        color: '#172033'
    },

    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 9
    },

    currentStock: {
        backgroundColor: '#F1F5F9',
        borderRadius: 9,
        padding: 14,
        marginBottom: 22
    },

    currentStockNumber: {
        fontSize: 27,
        fontWeight: '800',
        color: '#1E3A8A'
    },

    currentStockText: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4
    },

    countInput: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 17,
        color: '#172033',
        backgroundColor: '#FFFFFF'
    },

    helperText: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 7,
        marginBottom: 19
    },

    botonGuardar: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center'
    },

    textoBoton: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13
    },

    botonCancelar: {
        padding: 13,
        alignItems: 'center'
    },

    textoCancelar: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '700'
    }

});