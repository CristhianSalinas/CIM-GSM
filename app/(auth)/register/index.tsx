import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

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

interface Rol {
    id_rol: number;
    nombre: string;
}

export default function register() {

    // Estados del formulario
    const [usuario, setUsuario] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [cedula, setCedula] = useState('');
    const [tipocedula, setTipocedula] = useState<number | ''>('');
    const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
    
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
    const [cargandoTipos, setCargandoTipos] = useState(false);

    const [roles, setRoles] = useState<Rol[]>([]);
    const [rolSeleccionado, setRolSeleccionado] = useState<number | ''>('');

    // Estados de control
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarPasswordConfirmacion, setMostrarPasswordConfirmacion] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargandoTipos(true);

                // Consultar tipos de documento
                const respuestaDocumentos = await fetch(
                    `${API_URL}/api/tipos-documento/`
                );

                if (!respuestaDocumentos.ok) {
                    throw new Error('Error consultando documentos');
                }

                const documentos = await respuestaDocumentos.json();
                setTiposDocumento(documentos);

                // Consultar roles
                const respuestaRoles = await fetch(
                    `${API_URL}/api/rol/`
                );

                if (!respuestaRoles.ok) {
                    throw new Error('Error consultando roles');
                }

                const datosRoles = await respuestaRoles.json();
                setRoles(datosRoles);

            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setCargandoTipos(false);
            }
        };

        cargarDatos();
    }, []);

    const registrarUsuario = async () => {
        console.log('BOTÓN DE REGISTER PRESIONADO');

        if (cargando) return;

        // Validar campos obligatorios
        if (
            !tipocedula ||
            !cedula.trim() ||
            !usuario.trim() ||
            !nombre.trim() ||
            !apellido.trim() ||
            !correo.trim() ||
            !direccion.trim() ||
            !telefono.trim() ||
            !rolSeleccionado
        ) {
            Alert.alert(
                'Campos obligatorios',
                'Completa todos los campos.'
            );
            return;
        }

        // Validar contraseña
        if (!password || !passwordConfirmacion) {
            Alert.alert(
                'Contraseña',
                'Ingresa y confirma tu contraseña.'
            );
            return;
        }

        if (password !== passwordConfirmacion) {
            Alert.alert(
                'Contraseñas diferentes',
                'Las contraseñas no coinciden.'
            );
            return;
        }

        try {
            setCargando(true);

            const respuesta = await fetch(
                `${API_URL}/api/usuarios/crear`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_tipo_documento: tipocedula,
                        numero_documento: cedula.trim(),
                        nombre: nombre.trim(),
                        apellido: apellido.trim(),
                        usuario: usuario.trim(),
                        telefono: telefono.trim(),
                        direccion: direccion.trim(),
                        correo: correo.trim(),
                        password: password,
                        id_rol: rolSeleccionado,
                        estado: true,
                    }),
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                const detalle = datos.detail;
                const mensaje = typeof detalle === 'string'
                    ? detalle
                    : 'No fue posible registrar el usuario.';
                throw new Error(mensaje);
            }

            if (Platform.OS === 'web') {
                window.alert('Usuario creado exitosamente.');
            } else {
                Alert.alert(
                    'Registro exitoso',
                    'El usuario fue creado correctamente.'
                );
            }

        } catch (error: unknown) {
            console.error('ERROR REGISTRO:', error);

            const mensaje = error instanceof Error
                ? error.message
                : 'No fue posible conectar con el servidor.';

            if (Platform.OS === 'web') {
                window.alert(mensaje);
            } else {
                Alert.alert('Error al crear usuario', mensaje);
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
                        Registrar usuario
                    </Text>

                    <Text style={styles.descripcion}>
                        Completa los datos para dar de alta un usuario en el sistema.
                    </Text>

                    {/* FILA 1: Tipo de documento y Cédula */}
                    <View style={styles.filaDoble}>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Tipo de documento</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={tipocedula}
                                    onValueChange={(itemValue) =>
                                        setTipocedula(itemValue === '' ? '' : Number(itemValue))
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
                            <Text style={styles.label}>Nº de Documento</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nº de cédula"
                                placeholderTextColor="#AAA"
                                value={cedula}
                                onChangeText={setCedula}
                                keyboardType="numeric"
                                editable={!cargando}
                            />
                        </View>
                    </View>
                                        
                    {/* FILA 2: Nombre y Apellido */}
                    <View style={styles.filaDoble}>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre"
                                placeholderTextColor="#AAA"
                                value={nombre}
                                onChangeText={setNombre}
                                autoCapitalize="words"
                                editable={!cargando}
                            />
                        </View>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Apellido</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Apellido"
                                placeholderTextColor="#AAA"
                                value={apellido}
                                onChangeText={setApellido}
                                autoCapitalize="words"
                                editable={!cargando}
                            />
                        </View>
                    </View>

                    {/* FILA 3: Usuario y Teléfono */}
                    <View style={styles.filaDoble}>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Usuario</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Usuario"
                                placeholderTextColor="#AAA"
                                value={usuario}
                                onChangeText={setUsuario}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!cargando}
                            />
                        </View>
                        <View style={styles.columna}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Teléfono"
                                placeholderTextColor="#AAA"
                                value={telefono}
                                onChangeText={setTelefono}
                                keyboardType="phone-pad"
                                editable={!cargando}
                            />
                        </View>
                    </View>

                    {/* DIRECCIÓN */}
                    <Text style={styles.label}>Dirección</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Dirección de residencia"
                        placeholderTextColor="#AAA"
                        value={direccion}
                        onChangeText={setDireccion}
                        autoCapitalize="sentences"
                        editable={!cargando}
                    />

                    {/* CORREO */}
                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="correo@empresa.com"
                        placeholderTextColor="#AAA"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!cargando}
                    />

                    {/* CONTRASEÑA */}
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#AAA"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!mostrarPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!cargando}
                        />
                        <TouchableOpacity
                            onPress={() => setMostrarPassword(!mostrarPassword)}
                            disabled={cargando}
                            style={styles.btnMostrarContainer}
                        >
                            <Text style={styles.mostrar}>
                                {mostrarPassword ? 'Ocultar' : 'Ver'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* CONFIRMAR CONTRASEÑA */}
                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#AAA"
                            value={passwordConfirmacion}
                            onChangeText={setPasswordConfirmacion}
                            secureTextEntry={!mostrarPasswordConfirmacion}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!cargando}
                        />
                        <TouchableOpacity
                            onPress={() => setMostrarPasswordConfirmacion(!mostrarPasswordConfirmacion)}
                            disabled={cargando}
                            style={styles.btnMostrarContainer}
                        >
                            <Text style={styles.mostrar}>
                                {mostrarPasswordConfirmacion ? 'Ocultar' : 'Ver'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ROL */}
                    <Text style={styles.label}>Rol en el Sistema</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={rolSeleccionado}
                            onValueChange={(itemValue) =>
                                setRolSeleccionado(
                                    itemValue === '' ? '' : Number(itemValue)
                                )
                            }
                            enabled={!cargando && !cargandoTipos}
                            style={styles.picker}
                        >
                            <Picker.Item
                                label="Selecciona un rol"
                                value=""
                                color="#888"
                            />
                            {roles.map((rol) => (
                                <Picker.Item
                                    key={rol.id_rol}
                                    label={rol.nombre}
                                    value={rol.id_rol}
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* BOTÓN REGISTRAR */}
                    <TouchableOpacity
                        style={[
                            styles.boton,
                            cargando && styles.botonDeshabilitado
                        ]}
                        onPress={registrarUsuario}
                        disabled={cargando}
                        activeOpacity={0.8}
                    >
                        {cargando ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.textoBoton}>
                                REGISTRAR USUARIO
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

// ESTILOS COMPACTOS Y SERIOS
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
        gap: 10, // Espacio entre los dos campos de la fila (requiere React Native 0.71+, si falla usar marginHorizontal)
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BCCCDC',
        borderRadius: 6,
        backgroundColor: '#F8FAFC',
        height: 40,
    },
    inputPassword: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        fontSize: 13,
        color: '#102A43',
    },
    btnMostrarContainer: {
        paddingHorizontal: 10,
        height: '100%',
        justifyContent: 'center',
    },
    mostrar: {
        color: '#243B53',
        fontWeight: '600',
        fontSize: 11,
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