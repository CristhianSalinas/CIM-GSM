
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
    Platform
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface ProductoRespuesta {
    id_producto: number;
    codigo_sm: string;
    nombre: string;
    id_categoria: number;
    referencia: string;
    descripcion: string;
    precio: number;
    cantidad_fisica: number;
}

export default function ProductoInventario() {

    const router = useRouter();

    // Parámetros recibidos desde la pantalla anterior
    const {
        id_inventario,
        id_categoria,
        categoria
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
    

    // Consultar productos de la categoría
   
const cargarProductos = useCallback(async (esActualizacion = false) => {
    try {
        setError('');

        const token = await obtenerToken();

        if (!token) {
            throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
        }

        const categoriaId = Number(id_categoria);

        if (!Number.isFinite(categoriaId)) {
            throw new Error('El identificador de categoría no es válido.');
        }

        const respuesta = await fetch(`${API_URL}/api/productos/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
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

        // Aceptar tanto una lista directa como una respuesta dentro de "productos"
        const listaProductos = Array.isArray(resultado)
            ? resultado
            : resultado?.productos;

        if (!Array.isArray(listaProductos)) {
            console.log('Respuesta recibida de productos:', resultado);
            throw new Error('El servidor no devolvió una lista válida de productos.');
        }

        console.log('Categoría solicitada:', categoriaId);
        console.log('Total de productos recibidos:', listaProductos.length);

        console.log(
            'Categorías recibidas:',
            listaProductos.map((p: any) => ({
                id_producto: p.id_producto,
                nombre: p.nombre,
                id_categoria: p.id_categoria
            }))
        );

        const productosFiltrados: Producto[] = listaProductos
            .filter((item: any) =>
                Number(item.id_categoria) === categoriaId
              )
              .map((item: any) => ({
                  id_producto: Number(item.id_producto),
                  codigo_sm: item.codigo_sm ?? '',
                  nombre: item.nombre ?? item.Nombre ?? '',
                  id_categoria: Number(item.id_categoria),
                  referencia: item.referencia ?? '',
                  descripcion: item.descripcion ?? '',
                  precio: Number(item.precio ?? 0),
                  cantidad_fisica: Number(item.cantidad_fisica ?? item.Cantidad_fisica ?? 0),
                  cantidad_contada: ''
              }));

          // Conservar los conteos que ya había digitado el usuario
          setProductos(actuales =>
              productosFiltrados.map(item => {
                  const anterior = actuales.find(
                      p => p.id_producto === item.id_producto
                  );

                  return {
                      ...item,
                      cantidad_contada: anterior?.cantidad_contada ?? ''
                  };
              })
          );

          console.log('Productos encontrados para la categoría:', productosFiltrados.length);

          if (listaProductos.length > 0 && productosFiltrados.length === 0) {
              console.warn(
                  `Hay ${listaProductos.length} productos, pero ninguno tiene id_categoria = ${categoriaId}.`
              );
          }

      } catch (error) {
          console.log('Error cargando productos:', error);

          setError(
              error instanceof Error
                  ? error.message
                  : 'No fue posible cargar los productos.'
          );

      } finally {
          setCargando(false);
          setActualizando(false);
      }
  }, [id_categoria]);


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
        cargarProductos(true);
    };

    const reintentar = () => {
    setCargando(true);
    cargarProductos();
};

// Modificar cantidad encontrada
const modificarCantidad = (
    id_producto: number,
    valor: string
) => {
    if (!/^\d*$/.test(valor)) {
        return;
    }

    setProductos(actuales =>
        actuales.map(item =>
            item.id_producto === id_producto
                ? { ...item, cantidad_contada: valor }
                : item
        )
    );
};

    // Calcular diferencia de un producto
    const calcularDiferencia = (item: Producto): number | null => {

        if (item.cantidad_contada === '') {
            return null;
        }

        return Number(item.cantidad_contada) - item.cantidad_fisica;

    };

    // Cantidad de productos contados
    const productosContados = productos.filter(
        item => item.cantidad_contada !== ''
    ).length;

    // Productos pendientes
    const productosPendientes = productos.length - productosContados;

    // Sumar diferencias
    const totalDiferencias = productos.reduce((total, item) => {

        const diferencia = calcularDiferencia(item);

        return total + (diferencia ?? 0);

    }, 0);

    // Mostrar confirmación antes de finalizar
    const enviarInventario = () => {

        if (enviando) {
            return;
        }

        if (productos.length === 0) {

            Alert.alert(
                'Sin productos',
                'No hay productos para registrar.'
            );

            return;
        }

        if (productosPendientes > 0) {

            Alert.alert(
                'Conteo incompleto',
                `Debes contar los ${productosPendientes} productos pendientes antes de finalizar.`
            );

            return;
        }

        Alert.alert(
            'Finalizar inventario',
            `¿Confirmas el conteo de ${productos.length} productos de la categoría ${categoria || 'seleccionada'}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Finalizar',
                    onPress: confirmarEnvio
                }
            ]
        );

    };

    
const confirmarEnvio = async () => {
    try {
        setEnviando(true);

        const token = await obtenerToken();

        if (!token) {
            throw new Error('No hay una sesión activa. Inicia sesión nuevamente.');
        }

        const datos = {
            productos: productos.map(item => ({
                id_producto: item.id_producto,
                cantidad_actual: Number(item.cantidad_contada),
                observacion: null
            }))
        };

        const respuesta = await fetch(
            `${API_URL}/api/inventarios/${id_inventario}/finalizar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            const mensaje =
                resultado?.detail ||
                resultado?.mensaje ||
                `Error HTTP: ${respuesta.status}`;

            throw new Error(
                typeof mensaje === 'string'
                    ? mensaje
                    : JSON.stringify(mensaje)
            );
        }

        Alert.alert(
            'Inventario finalizado',
            resultado?.mensaje || 'El conteo se guardó correctamente.',
            [
                {
                    text: 'Aceptar',
                    onPress: () => router.back()
                }
            ],
            { cancelable: false }
        );

    } catch (error) {
        console.log('Error enviando inventario:', error);

        Alert.alert(
            'Error al guardar',
            error instanceof Error
                ? error.message
                : 'No fue posible guardar el inventario.'
        );

    } finally {
        setEnviando(false);
    }
};

    return (

        <SafeAreaView style={styles.safeArea}>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >

                {/* ENCABEZADO */}
                <View style={styles.encabezado}>

                    <BotonVolver />

                    <View style={styles.tituloContainer}>

                        <Text style={styles.title}>
                            Conteo de inventario
                        </Text>

                        <Text style={styles.subtitle}>
                            Registra las cantidades encontradas
                        </Text>

                    </View>

                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={actualizando}
                            onRefresh={actualizar}
                            colors={['#2563EB']}
                        />
                    }
                >

                    {/* INFORMACIÓN DEL INVENTARIO */}
                    <View style={styles.infoInventario}>

                        <Text style={styles.infoLabel}>
                            NÚMERO DE INVENTARIO
                        </Text>

                        <Text style={styles.numeroInventario}>
                            #{id_inventario}
                        </Text>

                        <View style={styles.divisor} />

                        <Text style={styles.infoLabel}>
                            CATEGORÍA A INVENTARIAR
                        </Text>

                        <Text style={styles.nombreCategoria}>
                            {categoria || 'Sin categoría'}
                        </Text>

                    </View>

                    {/* RESUMEN */}
                    {!cargando && !error && (

                        <View style={styles.resumen}>

                            <View style={styles.resumenItem}>

                                <Text style={styles.resumenNumero}>
                                    {productos.length}
                                </Text>

                                <Text style={styles.resumenTexto}>
                                    Productos
                                </Text>

                            </View>

                            <View style={styles.separadorResumen} />

                            <View style={styles.resumenItem}>

                                <Text style={styles.resumenNumero}>
                                    {productosContados}
                                </Text>

                                <Text style={styles.resumenTexto}>
                                    Contados
                                </Text>

                            </View>

                            <View style={styles.separadorResumen} />

                            <View style={styles.resumenItem}>

                                <Text
                                    style={[
                                        styles.resumenNumero,
                                        totalDiferencias !== 0 &&
                                        styles.numeroDiferencia
                                    ]}
                                >
                                    {totalDiferencias > 0
                                        ? `+${totalDiferencias}`
                                        : totalDiferencias}
                                </Text>

                                <Text style={styles.resumenTexto}>
                                    Diferencia total
                                </Text>

                            </View>

                        </View>

                    )}

                    {/* CARGANDO */}
                    {cargando ? (

                        <View style={styles.centro}>

                            <ActivityIndicator
                                size="large"
                                color="#2563EB"
                            />

                            <Text style={styles.mensaje}>
                                Cargando productos...
                            </Text>

                        </View>

                    ) : error ? (

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

                    ) : productos.length === 0 ? (

                        <View style={styles.vacio}>

                            <Text style={styles.vacioTitulo}>
                                No hay productos
                            </Text>

                            <Text style={styles.vacioTexto}>
                                No se encontraron productos asociados a esta categoría.
                            </Text>

                        </View>

                    ) : (

                        <View style={styles.listaProductos}>

                            <Text style={styles.tituloSeccion}>
                                Productos para contar
                            </Text>

                            <Text style={styles.descripcionSeccion}>
                                Ingresa en cada campo la cantidad que encuentres físicamente.
                            </Text>

                            {productos.map(item => {

                                const diferencia = calcularDiferencia(item);

                                return (

                                    <View
                                        key={item.id_producto}
                                        style={styles.productoCard}
                                    >

                                        {/* INFORMACIÓN DEL PRODUCTO */}
                                        <View style={styles.productoEncabezado}>

                                            <View style={styles.codigoContainer}>

                                                <Text style={styles.codigoLabel}>
                                                    CÓDIGO
                                                </Text>

                                                <Text style={styles.codigo}>
                                                    {item.codigo_sm}
                                                </Text>

                                            </View>

                                            <View style={styles.referenciaContainer}>

                                                <Text style={styles.codigoLabel}>
                                                    REFERENCIA
                                                </Text>

                                                <Text style={styles.referencia}>
                                                    {item.referencia || 'Sin referencia'}
                                                </Text>

                                            </View>

                                        </View>

                                        <Text style={styles.nombreProducto}>
                                            {item.nombre}
                                        </Text>

                                        {!!item.descripcion && (

                                            <Text style={styles.descripcionProducto}>
                                                {item.descripcion}
                                            </Text>

                                        )}

                                        <View style={styles.divisorProducto} />

                                        {/* CANTIDADES */}
                                        <View style={styles.cantidadesContainer}>

                                            <View style={styles.cantidadColumna}>

                                                <Text style={styles.cantidadLabel}>
                                                    STOCK REGISTRADO
                                                </Text>

                                                <Text style={styles.stockAnterior}>
                                                    {item.cantidad_fisica}
                                                </Text>

                                            </View>

                                            <View style={styles.cantidadColumna}>

                                                <Text style={styles.cantidadLabel}>
                                                    CANTIDAD ENCONTRADA
                                                </Text>

                                                <TextInput
                                                    style={styles.inputCantidad}
                                                    value={item.cantidad_contada}
                                                    onChangeText={valor =>
                                                        modificarCantidad(
                                                            item.id_producto,
                                                            valor
                                                        )
                                                    }
                                                    keyboardType="number-pad"
                                                    placeholder="0"
                                                    placeholderTextColor="#94A3B8"
                                                    maxLength={8}
                                                    editable={!enviando}
                                                />

                                            </View>

                                        </View>

                                        {/* DIFERENCIA */}
                                        <View style={styles.diferenciaContainer}>

                                            <Text style={styles.diferenciaLabel}>
                                                DIFERENCIA
                                            </Text>

                                            {diferencia === null ? (

                                                <Text style={styles.sinContar}>
                                                    Pendiente de conteo
                                                </Text>

                                            ) : (

                                                <Text
                                                    style={[
                                                        styles.diferenciaValor,
                                                        diferencia > 0 && styles.diferenciaPositiva,
                                                        diferencia < 0 && styles.diferenciaNegativa,
                                                        diferencia === 0 && styles.diferenciaIgual
                                                    ]}
                                                >
                                                    {diferencia > 0 ? '+' : ''}
                                                    {diferencia}

                                                    {diferencia > 0
                                                        ? ' unidades sobrantes'
                                                        : diferencia < 0
                                                            ? ' unidades faltantes'
                                                            : ' Sin diferencias'
                                                    }

                                                </Text>

                                            )}

                                        </View>

                                    </View>

                                );

                            })}

                        </View>

                    )}

                    {/* FINALIZAR INVENTARIO */}
                    {!cargando && !error && productos.length > 0 && (

                        <View style={styles.finalizarContainer}>

                            <Text style={styles.avisoFinalizar}>
                                {productosPendientes > 0
                                    ? `Faltan ${productosPendientes} productos por contar.`
                                    : 'Verifica las cantidades antes de finalizar. El conteo quedará registrado.'
                                }
                            </Text>

                            <Pressable
                                style={({ pressed }) => [

                                    styles.botonFinalizar,

                                    pressed && styles.botonPresionado,

                                    (enviando || productosPendientes > 0) &&
                                    styles.botonDeshabilitado

                                ]}
                                onPress={enviarInventario}
                                disabled={enviando || productosPendientes > 0}
                            >

                                {enviando ? (

                                    <ActivityIndicator color="#FFFFFF" />

                                ) : (

                                    <Text style={styles.textoBotonFinalizar}>
                                        FINALIZAR INVENTARIO
                                    </Text>

                                )}

                            </Pressable>

                        </View>

                    )}

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },

    container: {
        flex: 1,
        backgroundColor: '#F5F7FB',
        padding: 16,
    },

    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15,
    },

    tituloContainer: {
        flex: 1,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },

    subtitle: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 3,
    },

    infoInventario: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
    },

    infoLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 0.7,
    },

    numeroInventario: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginTop: 5,
    },

    nombreCategoria: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 5,
    },

    divisor: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 14,
    },

    resumen: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 2,
    },

    resumenItem: {
        flex: 1,
        alignItems: 'center',
    },

    resumenNumero: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A8A',
    },

    resumenTexto: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'center',
    },

    separadorResumen: {
        width: 1,
        height: 35,
        backgroundColor: '#E5E7EB',
    },

    numeroDiferencia: {
        color: '#DC2626',
    },

    listaProductos: {
        gap: 12,
    },

    tituloSeccion: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    descripcionSeccion: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },

    productoCard: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
    },

    productoEncabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },

    codigoContainer: {
        flex: 1,
    },

    referenciaContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },

    codigoLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: 'bold',
    },

    codigo: {
        fontSize: 13,
        color: '#1D4ED8',
        fontWeight: 'bold',
        marginTop: 3,
    },

    referencia: {
        fontSize: 12,
        color: '#475569',
        marginTop: 3,
        textAlign: 'right',
    },

    nombreProducto: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: 'bold',
        marginTop: 12,
    },

    descripcionProducto: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 5,
    },

    divisorProducto: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 14,
    },

    cantidadesContainer: {
        flexDirection: 'row',
        gap: 12,
    },

    cantidadColumna: {
        flex: 1,
    },

    cantidadLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 8,
    },

    stockAnterior: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        textAlign: 'center',
        overflow: 'hidden',
    },

    inputCantidad: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#93C5FD',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 9,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1D4ED8',
        textAlign: 'center',
        minHeight: 48,
    },

    diferenciaContainer: {
        marginTop: 14,
        padding: 10,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },

    diferenciaLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 5,
    },

    sinContar: {
        fontSize: 12,
        color: '#D97706',
        fontWeight: '600',
    },

    diferenciaValor: {
        fontSize: 12,
        fontWeight: 'bold',
    },

    diferenciaPositiva: {
        color: '#15803D',
    },

    diferenciaNegativa: {
        color: '#DC2626',
    },

    diferenciaIgual: {
        color: '#2563EB',
    },

    finalizarContainer: {
        marginTop: 20,
        marginBottom: 30,
    },

    avisoFinalizar: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 18,
    },

    botonFinalizar: {
        backgroundColor: '#15803D',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },

    botonPresionado: {
        backgroundColor: '#166534',
    },

    botonDeshabilitado: {
        opacity: 0.5,
    },

    textoBotonFinalizar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    centro: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    mensaje: {
        color: '#64748B',
        marginTop: 10,
    },

    error: {
        color: '#DC2626',
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
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
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
