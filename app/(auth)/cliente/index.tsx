
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

import { obtenerToken } from '../../../constants/auth';
import BotonInicio from '../../../componentes/botones/boton_inicio';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView
} from 'react-native';

import { API_URL } from '../../../constants/api';

interface TipoDocumento {
    id_tipo: number;
    nombre: string;
}

export default function CrearCliente() {

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');

    const [tipocedula, setTipocedula] = useState<number | ''>('');

    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
    const [cargandoTipos, setCargandoTipos] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Cargar tipos de documento
    useEffect(() => {
        const cargarTiposDocumento = async () => {
            try {
                setCargandoTipos(true);

                const respuesta = await fetch(
                    `${API_URL}/api/tipos-documento/`
                );

                if (!respuesta.ok) {
                    throw new Error('Error consultando tipos de documento.');
                }

                const documentos = await respuesta.json();
                setTiposDocumento(documentos);

            } catch (error) {
                console.error('Error cargando documentos:', error);

                const mensaje = 'No fue posible cargar los tipos de documento.';

                if (Platform.OS === 'web') {
                    window.alert(mensaje);
                } else {
                    Alert.alert('Error', mensaje);
                }
            } finally {
                setCargandoTipos(false);
            }
        };

        cargarTiposDocumento();
    }, []);

    // Registrar cliente
    const registrarCliente = async () => {

        if (cargando) return;

        // Validar campos obligatorios
        if (
            !tipocedula ||
            !nombre.trim()
        ) {
            const mensaje = 'El tipo de documento y el nombre son obligatorios.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Campos obligatorios', mensaje);
            }

            return;
        }

        if (cedula.trim().length > 20) {
            const mensaje = 'El número de documento no puede superar 20 caracteres.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Documento inválido', mensaje);
            }

            return;
        }

        if (nombre.trim().length > 45 || apellidos.trim().length > 45) {
            const mensaje = 'El nombre y los apellidos no pueden superar 45 caracteres.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Datos inválidos', mensaje);
            }

            return;
        }

        if (direccion.trim().length > 45) {
            const mensaje = 'La dirección no puede superar 45 caracteres.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Dirección inválida', mensaje);
            }

            return;
        }

        if (telefono.trim().length > 20) {
            const mensaje = 'El teléfono no puede superar 20 caracteres.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Teléfono inválido', mensaje);
            }

            return;
        }

        try {
            setCargando(true);
            const token = await obtenerToken();

            const respuesta = await fetch(
                `${API_URL}/api/clientes/crear`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_tipo_documento: tipocedula,
                        numero_documento: cedula.trim() || null,
                        nombre: nombre.trim(),
                        apellidos: apellidos.trim() || null,
                        direccion: direccion.trim() || null,
                        telefono: telefono.trim() || null,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                const detalle = datos.detail;

                const mensaje = typeof detalle === 'string'
                    ? detalle
                    : 'No fue posible registrar el cliente.';

                throw new Error(mensaje);
            }

            if (Platform.OS === 'web') {
                window.alert('Cliente creado exitosamente.');
            } else {
                Alert.alert(
                    'Registro exitoso',
                    'El cliente fue creado correctamente.',
                    [
                        {
                            text: 'Aceptar',
                            onPress: () => router.back()
                        }
                    ]
                );
            }

            if (Platform.OS === 'web') {
                router.back();
            }

        } catch (error: unknown) {
            console.error('ERROR REGISTRO CLIENTE:', error);

            const mensaje = error instanceof Error
                ? error.message
                : 'No fue posible conectar con el servidor.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Error al crear cliente', mensaje);
            }

        } finally {
            setCargando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.contenido}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                {/* LOGO */}
                <View style={styles.logoContainer}>
                    <BotonInicio />
                    <Text style={styles.logo}>CIM</Text>
                    <Text style={styles.subtitulo}>
                        Control de Inventarios y Movimientos
                    </Text>
                </View>

                {/* FORMULARIO */}
                <View style={styles.formulario}>

                    <Text style={styles.titulo}>
                        Registrar cliente
                    </Text>

                    <Text style={styles.descripcion}>
                        Completa los datos para registrar un nuevo cliente en el sistema.
                    </Text>

                    {/* FILA 1: Tipo de documento y número */}
                    <View style={styles.filaDoble}>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Tipo de documento *</Text>

                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tipocedula}
                                    onValueChange={(itemValue) =>
                                        setTipocedula(
                                            itemValue === '' ? '' : Number(itemValue)
                                        )
                                    }
                                    enabled={!cargando && !cargandoTipos}
                                    style={styles.picker}
                                >
                                    <Picker.Item
                                        label={cargandoTipos ? 'Cargando...' : 'Seleccione'}
                                        value=""
                                        color="#888"
                                    />

                                    {tiposDocumento.map((tipo) => (
                                        <Picker.Item
                                            key={tipo.id_tipo}
                                            label={tipo.nombre}
                                            value={tipo.id_tipo}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.columna}>
                            <Text style={styles.label}>N.º de documento</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Número de documento"
                                placeholderTextColor="#AAA"
                                value={cedula}
                                onChangeText={setCedula}
                                keyboardType="numeric"
                                maxLength={20}
                                editable={!cargando}
                            />
                        </View>
                    </View>

                    {/* FILA 2: Nombre y apellidos */}
                    <View style={styles.filaDoble}>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Nombre *</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                placeholderTextColor="#AAA"
                                value={nombre}
                                onChangeText={setNombre}
                                autoCapitalize="words"
                                maxLength={45}
                                editable={!cargando}
                            />
                        </View>

                        <View style={styles.columna}>
                            <Text style={styles.label}>Apellidos</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Apellidos"
                                placeholderTextColor="#AAA"
                                value={apellidos}
                                onChangeText={setApellidos}
                                autoCapitalize="words"
                                maxLength={45}
                                editable={!cargando}
                            />
                        </View>
                    </View>

                    {/* FILA 3: Teléfono */}
                    <Text style={styles.label}>Teléfono</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Número de contacto"
                        placeholderTextColor="#AAA"
                        value={telefono}
                        onChangeText={setTelefono}
                        keyboardType="phone-pad"
                        maxLength={20}
                        editable={!cargando}
                    />

                    {/* DIRECCIÓN */}
                    <Text style={styles.label}>Dirección</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Dirección del cliente"
                        placeholderTextColor="#AAA"
                        value={direccion}
                        onChangeText={setDireccion}
                        autoCapitalize="sentences"
                        maxLength={45}
                        editable={!cargando}
                    />

                    {/* BOTÓN REGISTRAR */}
                    <TouchableOpacity
                        style={[
                            styles.boton,
                            cargando && styles.botonDeshabilitado
                        ]}
                        onPress={registrarCliente}
                        disabled={cargando}
                        activeOpacity={0.8}
                    >
                        {cargando ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.textoBoton}>
                                REGISTRAR CLIENTE
                            </Text>
                        )}
                    </TouchableOpacity>

                </View>

                {/* FOOTER */}
                <Text style={styles.footer}>
                    CIM © 2026 | Sistema de Inventarios
                </Text>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ESTILOS
const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#EAECEF',
    },
    contenido: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        fontSize: 34,
        fontWeight: '800',
        color: '#102A43',
        letterSpacing: 3,
    },
    subtitulo: {
        fontSize: 11,
        color: '#627D98',
        marginTop: 2,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    formulario: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#102A43',
        marginBottom: 4,
    },
    descripcion: {
        fontSize: 12,
        color: '#627D98',
        marginBottom: 16,
    },
    filaDoble: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    columna: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334E68',
        marginBottom: 4,
        marginTop: 10,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#BCCCDC',
        borderRadius: 6,
        paddingHorizontal: 10,
        fontSize: 13,
        color: '#102A43',
        backgroundColor: '#F8FAFC',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#BCCCDC',
        borderRadius: 6,
        backgroundColor: '#F8FAFC',
        height: 40,
        justifyContent: 'center',
    },
    picker: {
        height: 40,
        width: '100%',
        color: '#102A43',
        marginTop: Platform.OS === 'ios' ? 0 : -4,
    },
    boton: {
        height: 44,
        backgroundColor: '#102A43',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
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
    footer: {
        textAlign: 'center',
        color: '#627D98',
        fontSize: 11,
        marginTop: 20,
    },
});
