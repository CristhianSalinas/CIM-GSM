import { useState, useEffect } from 'react';
import {obtenerUsuario} from '../constants/auth';


export const useUsuarioActual = () => {

    const [usuarioActual, setUsuarioActual] = useState<any>(null);
    const [cargandoUsuario, setCargandoUsuario] = useState(true);

    const cargarUsuario = async () => {
        try {
            const usuario = await obtenerUsuario();

            console.log('PERFIL:', usuario);

            setUsuarioActual(usuario);

        } catch (error) {
            console.error('Error cargando usuario:', error);
            setUsuarioActual(null);

        } finally {
            setCargandoUsuario(false);
        }
    };

    useEffect(() => {
        cargarUsuario();
    }, []);

    return {
        usuarioActual,
        setUsuarioActual,
        cargandoUsuario,
        cargarUsuario
    };
};