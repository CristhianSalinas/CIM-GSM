
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useRef
} from 'react';

import { router } from 'expo-router';
import { AppState } from 'react-native';

import {
    obtenerToken,
    obtenerUsuario,
    eliminarToken,
    tokenExpirado
} from '../constants/auth';

import { API_URL } from '../constants/api';


// Tipo del contexto
interface AuthContextType {
    usuarioActual: any;
    setUsuarioActual: React.Dispatch<React.SetStateAction<any>>;
    sesionActiva: boolean;
    cargandoSesion: boolean;
    verificarSesion: () => Promise<void>;
    cerrarSesion: () => Promise<void>;
}


// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Proveedor global
export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [usuarioActual, setUsuarioActual] = useState<any>(null);
    const [sesionActiva, setSesionActiva] = useState(false);
    const [cargandoSesion, setCargandoSesion] = useState(true);

    // Identificar si ya terminó la primera verificación
    const verificacionInicialTerminada = useRef(false);


    // Verificar sesión
    const verificarSesion = async () => {

        try {
            const token = await obtenerToken();

            console.log('¿EXISTE TOKEN?:', !!token);
            console.log(
                '¿TOKEN EXPIRADO?:',
                token ? tokenExpirado(token) : 'Sin token'
            );

            // 1. Comprobar existencia del token
            if (!token) {

                setSesionActiva(false);
                setUsuarioActual(null);

                router.replace('/(auth)/login');
                return;
            }

            // 2. Comprobar expiración local
            if (tokenExpirado(token)) {

                console.log('TOKEN EXPIRADO LOCALMENTE');

                await eliminarToken();

                setSesionActiva(false);
                setUsuarioActual(null);

                router.replace('/(auth)/login');
                return;
            }

            // 3. Validar token con FastAPI
            const respuesta = await fetch(`${API_URL}/api/productos/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log('VALIDACIÓN TOKEN:', respuesta.status);

            // 4. Token rechazado
            if (respuesta.status === 401) {

                console.log('TOKEN RECHAZADO POR EL SERVIDOR');

                await eliminarToken();

                setSesionActiva(false);
                setUsuarioActual(null);

                router.replace('/(auth)/login');
                return;
            }

            if (!respuesta.ok) {
                throw new Error(
                    `No se pudo validar la sesión. HTTP ${respuesta.status}`
                );
            }

            // 5. Recuperar perfil local
            const usuario = await obtenerUsuario();

            if (!usuario?.id_usuario) {
                throw new Error('No se encontró el perfil del usuario.');
            }

            setUsuarioActual(usuario);
            setSesionActiva(true);

            console.log('SESIÓN ACTIVA');
            console.log('PERFIL:', usuario);

        } catch (error) {

            console.error('Error verificando sesión:', error);

            // No eliminar token ante errores de conexión
            setSesionActiva(false);

        } finally {

            // Solo finalizar la carga de la primera verificación
            if (!verificacionInicialTerminada.current) {
                verificacionInicialTerminada.current = true;
                setCargandoSesion(false);
            }
        }
    };


    // Cerrar sesión
    const cerrarSesion = async () => {

        await eliminarToken();

        setUsuarioActual(null);
        setSesionActiva(false);

        router.replace('/(auth)/login');
    };


    // Verificar al iniciar y cuando la app vuelva a estar activa
    useEffect(() => {

        // Primera verificación
        verificarSesion();

        // Detectar cuando la aplicación vuelve al primer plano
        const suscripcion = AppState.addEventListener(
            'change',
            (estado) => {

                if (estado === 'active') {
                    console.log('Aplicación activa. Verificando sesión...');
                    verificarSesion();
                }

            }
        );

        return () => {
            suscripcion.remove();
        };

    }, []);


    return (
        <AuthContext.Provider
            value={{
                usuarioActual,
                setUsuarioActual,
                sesionActiva,
                cargandoSesion,
                verificarSesion,
                cerrarSesion
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


// Hook para consumir el contexto
export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth debe utilizarse dentro de AuthProvider'
        );
    }

    return context;
};
