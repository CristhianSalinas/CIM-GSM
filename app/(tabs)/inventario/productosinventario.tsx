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
    Platform,
    Modal,
    useWindowDimensions,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

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
    const { width } = useWindowDimensions();
    const esMovil = width < 768;

    const {
        id_inventario,
        id_categoria,
        categoria,
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

    const [modalVisible, setModalVisible] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidadModal, setCantidadModal] = useState('');
    const [guardandoConteo, setGuardandoConteo] = useState(false);

    // =========================================================================
    // MOSTRAR MENSAJES MULTIPLATAFORMA
    // =========================================================================
    const mostrarMensaje = (titulo: string, mensaje: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensaje}`);
        } else {
            Alert.alert(titulo, mensaje);
        }
    };

    // =========================================================================
    // CARGAR PRODUCTOS Y DETALLES DEL INVENTARIO
    // =========================================================================
    const cargarProductos = useCallback(async () => {
        try {
            setError('');

            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
            }

            const inventarioId = Number(id_inventario);
            const categoriaId = Number(id_categoria);

            if (!Number.isInteger(inventarioId) || inventarioId <= 0) {
                throw new Error('El identificador del inventario no es válido.');
            }

            if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
                throw new Error('El identificador de categoría no es válido.');
            }

            // 1. Consultar productos
            const respuesta = await fetch(`${API_URL}/api/productos/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
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
            const listaProductos = Array.isArray(resultado)
                ? resultado
                : resultado?.productos;

            if (!Array.isArray(listaProductos)) {
                throw new Error('El servidor no devolvió una lista válida de productos.');
            }

            // 2. Consultar detalles guardados del inventario
            const respuestaDetalles = await fetch(
                `${API_URL}/api/detalle-inventario/inventario/${inventarioId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!respuestaDetalles.ok) {
                throw new Error(
                    `No fue posible recuperar los detalles del inventario: ${respuestaDetalles.status}`
                );
            }

            const detalles = await respuestaDetalles.json();

            if (!Array.isArray(detalles)) {
                throw new Error('El servidor no devolvió los detalles del inventario.');
            }

            // 3. Relacionar los detalles con los productos
            const detallesPorProducto = new Map<number, any>(
                detalles.map((detalle: any) => [
                    Number(detalle.id_producto),
                    detalle,
                ])
            );

            // 4. Mostrar solamente productos asociados al inventario
            const productosFiltrados: Producto[] = listaProductos
                .filter((item: any) => Number(item.id_categoria) === categoriaId)
                .filter((item: any) => detallesPorProducto.has(Number(item.id_producto)))
                .map((item: any) => {
                    const detalle = detallesPorProducto.get(Number(item.id_producto));

                    return {
                        id_producto: Number(item.id_producto),
                        codigo_sm: item.codigo_sm ?? '',
                        nombre: item.nombre ?? item.Nombre ?? '',
                        id_categoria: Number(item.id_categoria),
                        referencia: item.referencia ?? '',
                        descripcion: item.descripcion ?? '',
                        precio: Number(item.precio ?? 0),
                        cantidad_fisica: Number(
                            item.cantidad_fisica ?? item.Cantidad_fisica ?? 0
                        ),
                        cantidad_contada:
                            Number(detalle.id_estado) === 1
                                ? String(detalle.cantidad_contada)
                                : '',
                    };
                });

            setProductos(productosFiltrados);
        } catch (err) {
            console.error('Error cargando productos:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'No fue posible cargar los productos.'
            );
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, [id_categoria, id_inventario]);

    // =========================================================================
    // CARGA INICIAL Y REFRESCO
    // =========================================================================
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
        cargarProductos();
    };

    const reintentar = () => {
        setCargando(true);
        cargarProductos();
    };

    // =========================================================================
    // MODAL DE CONTEO
    // =========================================================================
    const abrirModalConteo = (producto: Producto) => {
        if (enviando || guardandoConteo) return;

        setProductoSeleccionado(producto);
        setCantidadModal(producto.cantidad_contada);
        setModalVisible(true);
    };

    const guardarConteo = async () => {
        if (!productoSeleccionado || guardandoConteo) return;

        if (cantidadModal.trim() === '' || !/^\d+$/.test(cantidadModal)) {
            mostrarMensaje('Cantidad inválida', 'Ingresa una cantidad válida.');
            return;
        }

        try {
            setGuardandoConteo(true);

            const token = await obtenerToken();

            if (!token) {
                throw new Error('No hay una sesión activa.');
            }

            const datos = {
                id_inventario: Number(id_inventario),
                id_producto: productoSeleccionado.id_producto,
                cantidad_contada: Number(cantidadModal),
                observacion: 'Conteo físico de inventario',
            };

            const respuesta = await fetch(`${API_URL}/api/detalle-inventario/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });

            const resultado = await respuesta.json().catch(() => null);

            if (!respuesta.ok) {
                throw new Error(
                    resultado?.detail ||
                    resultado?.mensaje ||
                    `Error HTTP: ${respuesta.status}`
                );
            }

            setProductos(actuales =>
                actuales.map(item =>
                    item.id_producto === productoSeleccionado.id_producto
                        ? { ...item, cantidad_contada: cantidadModal }
                        : item
                )
            );

            setModalVisible(false);
            setProductoSeleccionado(null);
            setCantidadModal('');

            mostrarMensaje('Conteo registrado', 'La cantidad fue guardada correctamente.');
        } catch (err) {
            console.error('Error guardando conteo:', err);
            mostrarMensaje(
                'Error al registrar',
                err instanceof Error ? err.message : 'No fue posible registrar el conteo.'
            );
        } finally {
            setGuardandoConteo(false);
        }
    };

    // =========================================================================
    // CÁLCULOS Y FINALIZACIÓN
    // =========================================================================
    const calcularDiferencia = (item: Producto): number | null => {
        if (item.cantidad_contada === '') return null;
        return Number(item.cantidad_contada) - item.cantidad_fisica;
    };

    const productosContados = productos.filter(item => item.cantidad_contada !== '').length;
    const productosPendientes = productos.length - productosContados;

    const enviarInventario = () => {
        if (enviando || guardandoConteo) return;

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

        const mensaje = `¿Confirmas el conteo de ${productos.length} productos de la categoría ${categoria || 'seleccionada'}?`;

        if (Platform.OS === 'web') {
            if (window.confirm(`Finalizar inventario\n\n${mensaje}`)) {
                confirmarEnvio();
            }
            return;
        }

        Alert.alert('Finalizar inventario', mensaje, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Finalizar', onPress: confirmarEnvio },
        ]);
    };

    const confirmarEnvio = async () => {
        try {
            setEnviando(true);

            const token = await obtenerToken();
            if (!token) {
                throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
            }

            const respuesta = await fetch(
                `${API_URL}/api/inventarios/${id_inventario}/finalizar`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const resultado = await respuesta.json().catch(() => null);
   

console.log(
    'RESPUESTA DEL BACKEND AL FINALIZAR:',
    JSON.stringify(resultado, null, 2)
);

            if (!respuesta.ok) {
                const detalle = resultado?.detail;

                const mensajeError = Array.isArray(detalle)
                    ? detalle.map((item: any) => item.msg || JSON.stringify(item)).join('\n')
                    : typeof detalle === 'object' && detalle !== null
                        ? JSON.stringify(detalle)
                        : detalle || resultado?.mensaje || `Error HTTP: ${respuesta.status}`;

                throw new Error(mensajeError);
            }

            mostrarMensaje(
                'Inventario finalizado',
                resultado?.mensaje || 'El inventario se finalizó correctamente.'
            );

            router.back();
        } catch (err) {
            console.error('ERROR AL FINALIZAR:', err);
            mostrarMensaje(
                'Error al guardar',
                err instanceof Error ? err.message : 'No fue posible guardar el inventario.'
            );
        } finally {
            setEnviando(false);
        }
    };

    // =========================================================================
    // RENDERIZADO DE VISTA MÓVIL (TARJETAS APILADAS AL 100%)
    // =========================================================================
    const renderVistaMovil = () => (
        <View style={styles.listaMovil}>
            {productos.map(item => {
                const diferencia = calcularDiferencia(item);
                const contado = item.cantidad_contada !== '';

                return (
                    <Pressable
                        key={item.id_producto}
                        onPress={() => abrirModalConteo(item)}
                        style={({ pressed }) => [
                            styles.cardMovil,
                            contado && styles.cardMovilContada,
                            pressed && styles.cardMovilPresionada,
                        ]}
                    >
                        {/* Cabecera de tarjeta: Código + Estado */}
                        <View style={styles.cardMovilHeader}>
                            <View style={styles.pillCodigo}>
                                <Text style={styles.textoCodigo}>
                                    {item.codigo_sm || 'S/C'}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.badgeEstado,
                                    contado ? styles.badgeContado : styles.badgePendiente,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.textoEstado,
                                        contado ? styles.estadoContado : styles.estadoPendiente,
                                    ]}
                                >
                                    {contado ? 'CONTADO' : 'PENDIENTE'}
                                </Text>
                            </View>
                        </View>

                        {/* Nombre y descripción */}
                        <Text style={styles.cardMovilNombre} numberOfLines={2}>
                            {item.nombre}
                        </Text>

                        {!!item.descripcion && (
                            <Text style={styles.cardMovilDesc} numberOfLines={1}>
                                {item.descripcion}
                            </Text>
                        )}

                        {!!item.referencia && (
                            <Text style={styles.cardMovilRef}>
                                Ref: {item.referencia}
                            </Text>
                        )}

                        {/* Métricas: Sistema | Físico | Diferencia */}
                        <View style={styles.cardMovilMetricas}>
                            <View style={styles.metricaItem}>
                                <Text style={styles.metricaLabel}>SISTEMA</Text>
                                <Text style={styles.metricaValor}>{item.cantidad_fisica}</Text>
                            </View>

                            <View style={styles.metricaDivider} />

                            <View style={styles.metricaItem}>
                                <Text style={styles.metricaLabel}>FÍSICO</Text>
                                <Text
                                    style={[
                                        styles.metricaValor,
                                        contado && styles.textoContado,
                                    ]}
                                >
                                    {contado ? item.cantidad_contada : '-'}
                                </Text>
                            </View>

                            <View style={styles.metricaDivider} />

                            <View style={styles.metricaItem}>
                                <Text style={styles.metricaLabel}>DIFERENCIA</Text>
                                <Text
                                    style={[
                                        styles.metricaValor,
                                        diferencia !== null && diferencia > 0 && styles.textoPositivo,
                                        diferencia !== null && diferencia < 0 && styles.textoNegativo,
                                    ]}
                                >
                                    {diferencia === null
                                        ? '-'
                                        : diferencia > 0
                                            ? `+${diferencia}`
                                            : diferencia}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );

    // =========================================================================
    // RENDERIZADO DE VISTA WEB / ESCRITORIO (TABLA AL 100%)
    // =========================================================================
    const renderVistaWeb = () => (
        <View style={styles.tablaContenedor}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                style={styles.scrollHorizontal}
                contentContainerStyle={styles.scrollTablaContent}
            >
                <View style={styles.tabla}>
                    {/* CABECERA DE TABLA */}
                    <View style={[styles.filaTabla, styles.encabezadoTabla]}>
                        <Text style={[styles.celda, styles.celdaCodigo, styles.textoEncabezado]}>
                            CÓDIGO
                        </Text>
                        <Text
                            style={[
                                styles.celda,
                                styles.celdaNombre,
                                styles.textoEncabezado,
                                { textAlign: 'left' },
                            ]}
                        >
                            PRODUCTO
                        </Text>
                        <Text style={[styles.celda, styles.celdaReferencia, styles.textoEncabezado]}>
                            REFERENCIA
                        </Text>
                        <Text style={[styles.celda, styles.celdaCantidad, styles.textoEncabezado]}>
                            SISTEMA
                        </Text>
                        <Text style={[styles.celda, styles.celdaCantidad, styles.textoEncabezado]}>
                            FÍSICO
                        </Text>
                        <Text style={[styles.celda, styles.celdaCantidad, styles.textoEncabezado]}>
                            DIFERENCIA
                        </Text>
                        <Text
                            style={[
                                styles.celda,
                                styles.celdaEstado,
                                styles.textoEncabezado,
                                styles.sinBordeDerecho,
                            ]}
                        >
                            ESTADO
                        </Text>
                    </View>

                    {/* FILAS DE PRODUCTOS */}
                    {productos.map((item, index) => {
                        const diferencia = calcularDiferencia(item);
                        const contado = item.cantidad_contada !== '';
                        const esPar = index % 2 === 0;

                        return (
                            <Pressable
                                key={item.id_producto}
                                onPress={() => abrirModalConteo(item)}
                                style={({ pressed }) => [
                                    styles.filaTabla,
                                    esPar ? styles.filaPar : styles.filaImpar,
                                    contado && styles.filaContada,
                                    pressed && !contado && styles.filaPresionada,
                                ]}
                            >
                                <View style={[styles.celda, styles.celdaCodigo, styles.celdaCentrada]}>
                                    <View style={styles.pillCodigo}>
                                        <Text style={styles.textoCodigo}>
                                            {item.codigo_sm || 'S/C'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.celda, styles.celdaNombre, styles.celdaInicio]}>
                                    <Text style={styles.textoProducto} numberOfLines={2}>
                                        {item.nombre}
                                    </Text>
                                    {!!item.descripcion && (
                                        <Text style={styles.textoDescripcion} numberOfLines={1}>
                                            {item.descripcion}
                                        </Text>
                                    )}
                                </View>

                                <Text style={[styles.celda, styles.celdaReferencia, styles.textoSecundario]}>
                                    {item.referencia || '-'}
                                </Text>

                                <Text style={[styles.celda, styles.celdaCantidad, styles.textoNumerico]}>
                                    {item.cantidad_fisica}
                                </Text>

                                <Text
                                    style={[
                                        styles.celda,
                                        styles.celdaCantidad,
                                        styles.textoNumerico,
                                        contado && styles.textoContado,
                                    ]}
                                >
                                    {contado ? item.cantidad_contada : '-'}
                                </Text>

                                <Text
                                    style={[
                                        styles.celda,
                                        styles.celdaCantidad,
                                        styles.textoNumerico,
                                        diferencia !== null && diferencia > 0 && styles.textoPositivo,
                                        diferencia !== null && diferencia < 0 && styles.textoNegativo,
                                    ]}
                                >
                                    {diferencia === null
                                        ? '-'
                                        : diferencia > 0
                                            ? `+${diferencia}`
                                            : diferencia}
                                </Text>

                                <View
                                    style={[
                                        styles.celda,
                                        styles.celdaEstado,
                                        styles.celdaCentrada,
                                        styles.sinBordeDerecho,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.badgeEstado,
                                            contado ? styles.badgeContado : styles.badgePendiente,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.textoEstado,
                                                contado ? styles.estadoContado : styles.estadoPendiente,
                                            ]}
                                        >
                                            {contado ? 'CONTADO' : 'PENDIENTE'}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* BARRA SUPERIOR: VOLVER Y REFRESCAR */}
                    <View style={styles.topBar}>
                        <BotonVolver />

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

                    {/* ENCABEZADO DE PANTALLA */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={[styles.title, esMovil && styles.titleMovil]}>
                                Conteo de inventario
                            </Text>
                            <View style={styles.badgeInventario}>
                                <Text style={styles.textoBadgeInventario}>
                                    INV #{id_inventario}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.subtitle}>
                            Toca un producto para registrar su cantidad física encontrada
                        </Text>
                    </View>

                    {/* TARJETA DE RESUMEN DE PROGRESO */}
                    <View style={styles.infoBar}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>CATEGORÍA</Text>
                            <Text style={styles.infoVal} numberOfLines={1}>
                                {categoria || `Cat. ${id_categoria}`}
                            </Text>
                        </View>

                        <View style={styles.dividerVertical} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>CONTADOS</Text>
                            <Text style={styles.infoVal}>
                                {productosContados} / {productos.length}
                            </Text>
                        </View>

                        <View style={styles.dividerVertical} />

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PENDIENTES</Text>
                            <Text
                                style={[
                                    styles.infoVal,
                                    productosPendientes > 0
                                        ? styles.textoPendienteVal
                                        : styles.textoCompletadoVal,
                                ]}
                            >
                                {productosPendientes}
                            </Text>
                        </View>
                    </View>

                    {/* CONTENIDO PRINCIPAL */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={actualizando}
                                onRefresh={actualizar}
                                colors={['#1D4ED8']}
                                tintColor="#1D4ED8"
                            />
                        }
                    >
                        {cargando ? (
                            <View style={styles.centro}>
                                <ActivityIndicator size="large" color="#1D4ED8" />
                                <Text style={styles.mensaje}>Cargando productos...</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.centro}>
                                <Text style={styles.error}>{error}</Text>
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
                        ) : productos.length === 0 ? (
                            <View style={styles.vacio}>
                                <Text style={styles.vacioTitulo}>Sin productos</Text>
                                <Text style={styles.vacioTexto}>
                                    No hay elementos asociados a esta categoría.
                                </Text>
                            </View>
                        ) : esMovil ? (
                            renderVistaMovil()
                        ) : (
                            renderVistaWeb()
                        )}

                        {/* BARRA INFERIOR PARA FINALIZAR INVENTARIO */}
                        {!cargando && !error && productos.length > 0 && (
                            <View style={[styles.finalizarContainer, esMovil && styles.finalizarContainerMovil]}>
                                <Text style={[styles.avisoFinalizar, esMovil && styles.avisoFinalizarMovil]}>
                                    {productosPendientes > 0
                                        ? `Faltan ${productosPendientes} producto(s) por registrar conteo.`
                                        : 'Conteo completo. Ya puedes finalizar el inventario.'}
                                </Text>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.botonFinalizar,
                                        esMovil && styles.botonFinalizarMovil,
                                        pressed && { opacity: 0.88 },
                                        (enviando || productosPendientes > 0) && styles.botonDeshabilitado,
                                    ]}
                                    onPress={enviarInventario}
                                    disabled={enviando || productosPendientes > 0}
                                >
                                    {enviando ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.textoBotonFinalizar}>
                                            Finalizar inventario
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>

                    {/* MODAL PARA REGISTRAR O EDITAR CONTEO FÍSICO */}
                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => {
                            if (!guardandoConteo) setModalVisible(false);
                        }}
                    >
                        <KeyboardAvoidingView
                            style={styles.modalFondo}
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        >
                            <View style={styles.modalContenido}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitulo}>Registrar conteo físico</Text>
                                    <Pressable
                                        onPress={() => !guardandoConteo && setModalVisible(false)}
                                        style={styles.modalBotonCerrar}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.modalCerrarTexto}>✕</Text>
                                    </Pressable>
                                </View>

                                {productoSeleccionado && (
                                    <>
                                        <View style={styles.modalProductoCard}>
                                            <View style={styles.modalFilaSuperior}>
                                                <View style={styles.pillCodigo}>
                                                    <Text style={styles.textoCodigo}>
                                                        {productoSeleccionado.codigo_sm || 'S/C'}
                                                    </Text>
                                                </View>
                                                <View style={styles.modalPillStock}>
                                                    <Text style={styles.modalStock}>
                                                        Sistema: {productoSeleccionado.cantidad_fisica}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.modalProducto}>
                                                {productoSeleccionado.nombre}
                                            </Text>
                                        </View>

                                        <Text style={styles.modalEtiqueta}>
                                            Cantidad física encontrada
                                        </Text>

                                        <TextInput
                                            style={styles.modalInput}
                                            value={cantidadModal}
                                            onChangeText={valor => {
                                                if (/^\d*$/.test(valor)) setCantidadModal(valor);
                                            }}
                                            placeholder="0"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="number-pad"
                                            maxLength={7}
                                            editable={!guardandoConteo}
                                            autoFocus
                                        />

                                        <View style={styles.modalBotones}>
                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.botonCancelar,
                                                    pressed && { opacity: 0.7 },
                                                ]}
                                                onPress={() => setModalVisible(false)}
                                                disabled={guardandoConteo}
                                            >
                                                <Text style={styles.textoCancelar}>Cancelar</Text>
                                            </Pressable>

                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.botonGuardar,
                                                    guardandoConteo && styles.botonDeshabilitado,
                                                    pressed && !guardandoConteo && { opacity: 0.88 },
                                                ]}
                                                onPress={guardarConteo}
                                                disabled={guardandoConteo}
                                            >
                                                {guardandoConteo ? (
                                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                                ) : (
                                                    <Text style={styles.textoGuardar}>Guardar conteo</Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    </>
                                )}
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    // =========================================================================
    // 1. ESTRUCTURA BASE Y CONTENEDORES PRINCIPALES
    // =========================================================================
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 14,
        paddingTop: 12,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 36,
    },

    // =========================================================================
    // 2. BARRA SUPERIOR Y ENCABEZADO DE PANTALLA
    // =========================================================================
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    botonActualizarWrapper: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    botonActualizar: {
        fontSize: 12,
        color: '#1D4ED8',
        fontWeight: '600',
    },
    header: {
        marginBottom: 12,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    titleMovil: {
        fontSize: 19,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 12.5,
        marginTop: 3,
    },
    badgeInventario: {
        backgroundColor: '#DBEAFE',
        borderColor: '#BFDBFE',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    textoBadgeInventario: {
        fontSize: 10,
        fontWeight: '700',
        color: '#1D4ED8',
        letterSpacing: 0.3,
    },

    // =========================================================================
    // 3. TARJETA DE RESUMEN DE PROGRESO (CATEGORÍA / CONTADOS / PENDIENTES)
    // =========================================================================
    infoBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    infoLabel: {
        fontSize: 9.5,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.4,
    },
    infoVal: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 2,
    },
    textoPendienteVal: {
        color: '#B45309',
    },
    textoCompletadoVal: {
        color: '#15803D',
    },
    dividerVertical: {
        width: 1,
        height: 26,
        backgroundColor: '#E2E8F0',
    },

    // =========================================================================
    // 4. ESTADOS DE CARGA, ERROR Y LISTA VACÍA
    // =========================================================================
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    mensaje: {
        color: '#64748B',
        marginTop: 12,
        fontSize: 13,
        fontWeight: '500',
    },
    error: {
        color: '#B91C1C',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '500',
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
    vacio: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    vacioTitulo: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 4,
    },
    vacioTexto: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
    },

    // =========================================================================
    // 5. VISTA MÓVIL: TARJETAS APILADAS AL 100% DE ANCHO
    // =========================================================================
    listaMovil: {
        width: '100%',
        gap: 10,
    },
    cardMovil: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardMovilContada: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    cardMovilPresionada: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    cardMovilHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardMovilNombre: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 19,
    },
    cardMovilDesc: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    cardMovilRef: {
        fontSize: 11.5,
        color: '#475569',
        marginTop: 4,
        fontWeight: '500',
    },
    cardMovilMetricas: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        paddingVertical: 8,
        marginTop: 10,
    },
    metricaItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricaLabel: {
        fontSize: 9.5,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.4,
    },
    metricaValor: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 2,
    },
    metricaDivider: {
        width: 1,
        height: 22,
        backgroundColor: '#E2E8F0',
    },

    // =========================================================================
    // 6. VISTA WEB / ESCRITORIO: TABLA RESPONSIVA AL 100% DE ANCHO
    // =========================================================================
    tablaContenedor: {
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
    scrollHorizontal: {
        width: '100%',
    },
    scrollTablaContent: {
        flexGrow: 1,
        width: '100%',
    },
    tabla: {
        flex: 1,
        width: '100%',
        minWidth: 860,
    },
    filaTabla: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        minHeight: 52,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    encabezadoTabla: {
        backgroundColor: '#F1F5F9',
        minHeight: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
    },
    filaPar: {
        backgroundColor: '#FFFFFF',
    },
    filaImpar: {
        backgroundColor: '#F8FAFC',
    },
    filaContada: {
        backgroundColor: '#F0FDF4',
    },
    filaPresionada: {
        backgroundColor: '#EFF6FF',
    },

    // =========================================================================
    // 7. CELDAS Y COLUMNAS DE LA TABLA WEB
    // =========================================================================
    celda: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 12,
        color: '#334155',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
    },
    celdaCentrada: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    celdaInicio: {
        alignItems: 'flex-start',
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
    celdaCodigo: {
        flex: 1.1,
        minWidth: 105,
    },
    celdaNombre: {
        flex: 2.6,
        minWidth: 230,
    },
    celdaReferencia: {
        flex: 1.2,
        minWidth: 115,
    },
    celdaCantidad: {
        flex: 0.9,
        minWidth: 90,
    },
    celdaEstado: {
        flex: 1.2,
        minWidth: 120,
    },

    // =========================================================================
    // 8. TEXTOS, PILLS Y BADGES COMPARTIDOS
    // =========================================================================
    pillCodigo: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textoCodigo: {
        fontSize: 11.5,
        fontWeight: '600',
        color: '#334155',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    textoProducto: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    textoDescripcion: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    textoSecundario: {
        fontSize: 12,
        color: '#64748B',
    },
    textoNumerico: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#334155',
    },
    textoContado: {
        color: '#15803D',
        fontWeight: '700',
    },
    textoPositivo: {
        color: '#1D4ED8',
        fontWeight: '700',
    },
    textoNegativo: {
        color: '#B91C1C',
        fontWeight: '700',
    },
    badgeEstado: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        minWidth: 88,
        alignItems: 'center',
    },
    badgeContado: {
        backgroundColor: '#DCFCE7',
        borderColor: '#BBF7D0',
    },
    badgePendiente: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A',
    },
    textoEstado: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    estadoContado: {
        color: '#15803D',
    },
    estadoPendiente: {
        color: '#B45309',
    },

    // =========================================================================
    // 9. BARRA INFERIOR Y BOTÓN DE FINALIZAR INVENTARIO
    // =========================================================================
    finalizarContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    finalizarContainerMovil: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    avisoFinalizar: {
        flex: 1,
        minWidth: 200,
        fontSize: 12.5,
        color: '#475569',
        fontWeight: '500',
    },
    avisoFinalizarMovil: {
        textAlign: 'center',
        minWidth: 0,
    },
    botonFinalizar: {
        backgroundColor: '#1E293B',
        height: 44,
        paddingHorizontal: 22,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 180,
    },
    botonFinalizarMovil: {
        width: '100%',
    },
    botonDeshabilitado: {
        backgroundColor: '#94A3B8',
        opacity: 0.7,
    },
    textoBotonFinalizar: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // =========================================================================
    // 10. MODAL DE REGISTRO DE CONTEO FÍSICO
    // =========================================================================
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContenido: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 16,
    },
    modalTitulo: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    modalBotonCerrar: {
        backgroundColor: '#F1F5F9',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCerrarTexto: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    modalProductoCard: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    modalFilaSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    modalPillStock: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    modalStock: {
        fontSize: 11.5,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    modalProducto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        lineHeight: 20,
    },
    modalEtiqueta: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    modalInput: {
        height: 50,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },
    modalBotones: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 22,
    },
    botonCancelar: {
        flex: 1,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoCancelar: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    botonGuardar: {
        flex: 1,
        height: 44,
        backgroundColor: '#1E293B',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoGuardar: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});