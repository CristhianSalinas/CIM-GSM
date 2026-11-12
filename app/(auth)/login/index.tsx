import React, { useState } from 'react';
import { router } from 'expo-router';

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
import { guardarToken, guardarUsuario} from '../../../constants/auth';

export default function Login() {

    // Estados
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Iniciar sesión
    const iniciarSesion = async () => {
            console.log('BOTÓN DE LOGIN PRESIONADO');

            if (!usuario.trim() || !password) {
                Alert.alert('Campos obligatorios', 'Ingresa usuario y contraseña.');
                return;
            }

            try {
                setCargando(true);

                console.log('API UTILIZADA:', API_URL);
                console.log('Enviando solicitud de login...');

                const respuesta = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        usuario: usuario.trim(),
                        password: password,
                    }),
                });
                
                const datos = await respuesta.json();

                console.log('ESTADO HTTP:', respuesta.status);
                console.log('RESPUESTA BACKEND:', datos);

                if (!respuesta.ok) {
                    throw new Error(datos.detail || 'Error al iniciar sesión');
                }
                

                await guardarToken(datos.access_token);

                await guardarUsuario({
                    id_usuario: datos.id_usuario,
                    nombre: datos.nombre,
                    usuario: datos.usuario,
                    id_rol: datos.id_rol
                });

                router.replace('/');

                if (Platform.OS === 'web') {
                    window.alert('Inicio de sesión exitoso');
                } else {
                    Alert.alert('Bienvenido', 'Inicio de sesión exitoso.');
                }

                console.log('TOKEN:', datos.access_token);
                

            } catch (error: unknown) {
                console.error('ERROR LOGIN:', error);

                const mensaje = error instanceof Error
                    ? error.message
                    : 'No fue posible conectar con el servidor.';

                if (Platform.OS === 'web') {
                    window.alert(mensaje);
                } else {
                    Alert.alert('Error de inicio de sesión', mensaje);
                }

            } finally {
                setCargando(false);
            }
        };

    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.contenido}
                keyboardShouldPersistTaps="handled"
            >

                {/* LOGO */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>CIM</Text>

                    <Text style={styles.subtitulo}>
                        Control de Inventarios y Movimientos
                    </Text>
                </View>

                {/* FORMULARIO */}
                <View style={styles.formulario}>

                    <Text style={styles.titulo}>
                        Iniciar sesión
                    </Text>

                    <Text style={styles.descripcion}>
                        Ingresa tus credenciales para continuar.
                    </Text>

                    {/* USUARIO */}
                    <Text style={styles.label}>
                        Usuario o correo
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu usuario"
                        placeholderTextColor="#999"
                        value={usuario}
                        onChangeText={setUsuario}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!cargando}
                    />

                    {/* CONTRASEÑA */}
                    <Text style={styles.label}>
                        Contraseña
                    </Text>

                    <View style={styles.passwordContainer}>

                        <TextInput
                            style={styles.inputPassword}
                            placeholder="Ingresa tu contraseña"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!mostrarPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!cargando}
                        />

                        <TouchableOpacity
                            onPress={() =>
                                setMostrarPassword(!mostrarPassword)
                            }
                            disabled={cargando}
                        >
                            <Text style={styles.mostrar}>
                                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* BOTÓN LOGIN */}
                    <TouchableOpacity
                        style={[
                            styles.boton,
                            cargando && styles.botonDeshabilitado
                        ]}
                        onPress={iniciarSesion}
                        disabled={cargando}
                        activeOpacity={0.8}
                    >

                        {cargando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.textoBoton}>
                                INICIAR SESIÓN
                            </Text>
                        )}

                    </TouchableOpacity>

                </View>

                {/* FOOTER */}
                <Text style={styles.footer}>
                    CIM © 2026 | Sistema de inventarios
                </Text>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ESTILOS
const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },

    contenido: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25,
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },

    logo: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1D3557',
        letterSpacing: 5,
    },

    subtitulo: {
        fontSize: 13,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },

    formulario: {
        backgroundColor: '#FFFFFF',
        padding: 25,
        borderRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    titulo: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#1D3557',
        marginBottom: 8,
    },

    descripcion: {
        fontSize: 14,
        color: '#777',
        marginBottom: 25,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 9,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#222',
        backgroundColor: '#FAFAFA',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 9,
        backgroundColor: '#FAFAFA',
        paddingRight: 12,
    },

    inputPassword: {
        flex: 1,
        height: 50,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#222',
    },

    mostrar: {
        color: '#1D3557',
        fontWeight: '600',
        fontSize: 12,
    },

    boton: {
        height: 52,
        backgroundColor: '#1D3557',
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },

    botonDeshabilitado: {
        opacity: 0.6,
    },

    textoBoton: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },

    footer: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: 30,
    },

});