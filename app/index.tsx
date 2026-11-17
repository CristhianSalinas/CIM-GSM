import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../constants/api';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUsuarioActual } from '../hooks/useUsuarioActual';
import { useAuth } from '../context/AuthContext';
import { obtenerToken } from '../constants/auth';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    useWindowDimensions,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from 'react-native';

interface InventarioConteo {
    inventarios_pendientes: number;
    inventarios_en_progreso: number;
}

interface PedidoConteo {
    pedidos_pendientes: number;
    pedidos_en_progreso: number;
}

export default function Index() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const esPantallaGrande = width >= 768;

    const { usuarioActual } = useUsuarioActual();
    const { sesionActiva, cerrarSesion } = useAuth();

    const [inventario, setInventario] = useState<InventarioConteo>({
        inventarios_pendientes: 0,
        inventarios_en_progreso: 0,
    });

    const [movimientos, setMovimientos] = useState<PedidoConteo>({
        pedidos_pendientes: 0,
        pedidos_en_progreso: 0,
    });

    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const rolId = Number(usuarioActual?.id_rol);
    const esAdmin = rolId === 1;
    const puedeVerPendientesYHistorial = rolId === 1 || rolId === 2 || rolId === 3;

    // =========================================================================
    // CARGAR CONTEOS DEL DASHBOARD
    // =========================================================================
    const cargarinforme = useCallback(async () => {
        try {
            setError('');

            const token = await obtenerToken();

            const respuestainventario = await fetch(
                `${API_URL}/api/inventarios/conteo`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const datosinventario = await respuestainventario.json();

            if (!respuestainventario.ok) {
                throw new Error(
                    datosinventario.detail || 'No fue posible consultar los inventarios.'
                );
            }

            const respuestapedidos = await fetch(
                `${API_URL}/api/pedidos/conteo`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const datospedidos = await respuestapedidos.json();

            if (!respuestapedidos.ok) {
                throw new Error(
                    datospedidos.detail || 'No fue posible consultar los pedidos.'
                );
            }

            if (
                typeof datosinventario !== 'object' ||
                typeof datospedidos !== 'object'
            ) {
                throw new Error('La respuesta del servidor no tiene el formato esperado.');
            }

            setInventario(datosinventario);
            setMovimientos(datospedidos);
        } catch (e: any) {
            console.error('Error cargando datos:', e);
            setError(e.message || 'Error al cargar datos.');
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, []);

    useEffect(() => {
        cargarinforme();
    }, [cargarinforme]);

    const alRefrescar = () => {
        setActualizando(true);
        cargarinforme();
    };

    const crearUsuario = () => {
        setMenuVisible(false);
        router.push('/register');
    };

    const crearCliente = () => {
        setMenuVisible(false);
        router.push('/cliente');
    };

    const manejarCerrarSesion = () => {
        setMenuVisible(false);
        cerrarSesion();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={actualizando}
                        onRefresh={alRefrescar}
                        colors={['#1E3A8A']}
                        tintColor="#1E3A8A"
                    />
                }
            >
                <View
                    style={[
                        styles.container,
                        esPantallaGrande && styles.containerWeb,
                    ]}
                >
                    {/* =================================================== */}
                    {/* ENCABEZADO                                          */}
                    {/* =================================================== */}
                    <View style={styles.header}>
                        <View style={styles.headerBrand}>
                            <Text style={styles.systemName}>CIM</Text>
                            <Text style={styles.systemDescription} numberOfLines={1}>
                                Control de Inventarios y Movimientos
                            </Text>
                        </View>

                        <View style={styles.statusSystem}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Sistema activo</Text>
                        </View>
                    </View>

                    {/* =================================================== */}
                    {/* BIENVENIDA                                          */}
                    {/* =================================================== */}
                    <View style={[styles.welcome, !esPantallaGrande && styles.welcomeMobile]}>
                        <Text style={[styles.welcomeTitle, !esPantallaGrande && styles.welcomeTitleMobile]}>
                            Bienvenido
                        </Text>
                        <Text style={styles.welcomeSubtitle}>
                            Administra y controla las operaciones de inventario desde un solo lugar.
                        </Text>
                    </View>

                    {/* =================================================== */}
                    {/* FILA SUPERIOR: PERFIL + ACTIVIDADES PENDIENTES      */}
                    {/* =================================================== */}
                    <View
                        style={[
                            styles.topCardsWrapper,
                            esPantallaGrande && styles.topCardsWrapperWeb,
                        ]}
                    >
                        {/* TARJETA DE PERFIL */}
                        <View
                            style={[
                                styles.profileCard,
                                !esPantallaGrande && styles.profileCardMobile,
                            ]}
                        >
                            <Image
                                style={[
                                    styles.profileImage,
                                    !esPantallaGrande && styles.profileImageMobile,
                                ]}
                                source={require('../img/profile.png')}
                            />

                            <View style={styles.profileInfo}>
                                <Text style={styles.profileLabel}>
                                    {sesionActiva ? 'SESIÓN ACTIVA' : 'SESIÓN INACTIVA'}
                                </Text>

                                <Text style={styles.profileName} numberOfLines={1}>
                                    {usuarioActual?.usuario || 'Usuario no identificado'}
                                </Text>

                                <Text style={styles.profileRole}>
                                    {usuarioActual
                                        ? `ID de rol: ${usuarioActual.id_rol}`
                                        : 'Sin sesión iniciada'}
                                </Text>
                            </View>

                            <View style={styles.profileIndicator}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: sesionActiva
                                                ? '#22C55E'
                                                : '#EF4444',
                                        },
                                    ]}
                                />
                            </View>

                            {/* BOTÓN MENÚ */}
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setMenuVisible(true)}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.menuButtonText}>⋮</Text>
                            </TouchableOpacity>
                        </View>

                        {/* TARJETA DE ACTIVIDADES PENDIENTES */}
                        {puedeVerPendientesYHistorial && (
                            <View
                                style={[
                                    styles.activityCard,
                                    !esPantallaGrande && styles.activityCardMobile,
                                ]}
                            >
                                <View style={styles.activityTop}>
                                    <Text style={styles.activityLabel}>
                                        ACTIVIDADES PENDIENTES
                                    </Text>

                                    <View style={styles.activityIcon}>
                                        <Text style={styles.activityIconText}>!</Text>
                                    </View>
                                </View>

                                {cargando ? (
                                    <View style={styles.activityLoader}>
                                        <ActivityIndicator size="small" color="#2563EB" />
                                    </View>
                                ) : error ? (
                                    <Text style={styles.activityErrorText}>
                                        No fue posible cargar las actividades.
                                    </Text>
                                ) : (
                                    <View
                                        style={[
                                            styles.activityGroupsContainer,
                                            !esPantallaGrande && styles.activityGroupsMobile,
                                        ]}
                                    >
                                        {/* BLOQUE INVENTARIOS */}
                                        <View style={styles.activityGroup}>
                                            <Text style={styles.activitySection}>
                                                INVENTARIOS
                                            </Text>

                                            <View style={styles.activityStats}>
                                                <View style={styles.activityStat}>
                                                    <Text style={styles.activityNumber}>
                                                        {inventario.inventarios_pendientes}
                                                    </Text>
                                                    <Text style={styles.activityDescription}>
                                                        Pendientes
                                                    </Text>
                                                </View>

                                                <View style={styles.statDivider} />

                                                <View style={styles.activityStat}>
                                                    <Text style={styles.activityNumber}>
                                                        {inventario.inventarios_en_progreso}
                                                    </Text>
                                                    <Text style={styles.activityDescription}>
                                                        En progreso
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* BLOQUE PEDIDOS */}
                                        <View style={styles.activityGroup}>
                                            <Text style={styles.activitySection}>
                                                PEDIDOS
                                            </Text>

                                            <View style={styles.activityStats}>
                                                <View style={styles.activityStat}>
                                                    <Text style={styles.activityNumber}>
                                                        {movimientos.pedidos_pendientes}
                                                    </Text>
                                                    <Text style={styles.activityDescription}>
                                                        Pendientes
                                                    </Text>
                                                </View>

                                                <View style={styles.statDivider} />

                                                <View style={styles.activityStat}>
                                                    <Text style={styles.activityNumber}>
                                                        {movimientos.pedidos_en_progreso}
                                                    </Text>
                                                    <Text style={styles.activityDescription}>
                                                        En progreso
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* =================================================== */}
                    {/* SECCIÓN DE MÓDULOS                                  */}
                    {/* =================================================== */}
                    <View style={styles.modulesSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Módulos del sistema
                            </Text>
                            <Text style={styles.sectionSubtitle}>
                                Selecciona el módulo al que deseas ingresar.
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.modulesGrid,
                                esPantallaGrande && styles.modulesGridWeb,
                            ]}
                        >
                            {/* MÓDULO 01: INVENTARIO */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.moduleCard,
                                    esPantallaGrande && styles.moduleCardWeb,
                                    pressed && styles.modulePressed,
                                ]}
                                onPress={() => router.push('/(tabs)/inventario')}
                            >
                                <View style={styles.moduleImageContainer}>
                                    <Image
                                        source={require('../img/inventario.jpeg')}
                                        style={styles.moduleImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.moduleTag}>
                                        <Text style={styles.moduleTagText}>
                                            MÓDULO 01
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.moduleContent}>
                                    <View style={styles.moduleTextContainer}>
                                        <Text style={styles.moduleTitle}>
                                            Inventario
                                        </Text>
                                        <Text style={styles.moduleDescription}>
                                            Consulta, administra y verifica las existencias de productos.
                                        </Text>
                                    </View>

                                    <View style={styles.moduleAction}>
                                        <Text style={styles.moduleActionText}>
                                            Ingresar
                                        </Text>
                                        <Text style={styles.moduleArrow}>→</Text>
                                    </View>
                                </View>
                            </Pressable>

                            {/* MÓDULO 02: MOVIMIENTOS */}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.moduleCard,
                                    esPantallaGrande && styles.moduleCardWeb,
                                    pressed && styles.modulePressed,
                                ]}
                                onPress={() => router.push('/(tabs)/movimientos')}
                            >
                                <View style={styles.moduleImageContainer}>
                                    <Image
                                        source={require('../img/Movimientos.jpeg')}
                                        style={styles.moduleImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.moduleTag}>
                                        <Text style={styles.moduleTagText}>
                                            MÓDULO 02
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.moduleContent}>
                                    <View style={styles.moduleTextContainer}>
                                        <Text style={styles.moduleTitle}>
                                            Movimientos
                                        </Text>
                                        <Text style={styles.moduleDescription}>
                                            Gestiona entradas, salidas y movimientos de mercancía.
                                        </Text>
                                    </View>

                                    <View style={styles.moduleAction}>
                                        <Text style={styles.moduleActionText}>
                                            Ingresar
                                        </Text>
                                        <Text style={styles.moduleArrow}>→</Text>
                                    </View>
                                </View>
                            </Pressable>

                            {/* MÓDULO 03: HISTORIAL */}
                            {puedeVerPendientesYHistorial && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.moduleCard,
                                        esPantallaGrande && styles.moduleCardWeb,
                                        pressed && styles.modulePressed,
                                    ]}
                                    onPress={() => router.push('/(tabs)/historial')}
                                >
                                    <View style={styles.moduleImageContainer}>
                                        <Image
                                            source={require('../img/historial.jpeg')}
                                            style={styles.moduleImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.moduleTag}>
                                            <Text style={styles.moduleTagText}>
                                                MÓDULO 03
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.moduleContent}>
                                        <View style={styles.moduleTextContainer}>
                                            <Text style={styles.moduleTitle}>
                                                Historial
                                            </Text>
                                            <Text style={styles.moduleDescription}>
                                                Consulta y verifica el historial de pedidos e inventarios.
                                            </Text>
                                        </View>

                                        <View style={styles.moduleAction}>
                                            <Text style={styles.moduleActionText}>
                                                Ingresar
                                            </Text>
                                            <Text style={styles.moduleArrow}>→</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* =================================================== */}
                    {/* PIE DE PÁGINA                                       */}
                    {/* =================================================== */}
                    <View style={styles.footer}>
                        <Text style={styles.footerTitle}>CIM</Text>
                        <Text style={styles.footerText}>
                            Sistema de gestión y control de inventarios
                        </Text>
                        <Text style={styles.footerVersion}>Versión 1.0.0</Text>
                    </View>
                </View>
            </ScrollView>

            {/* =========================================================== */}
            {/* MODAL DE MENÚ DE USUARIO (EVITA RECORTES EN ANDROID)        */}
            {/* =========================================================== */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.dropdownMenuModal}>
                        <TouchableOpacity
                            style={styles.dropdownOption}
                            onPress={manejarCerrarSesion}
                        >
                            <Text style={styles.dropdownIcon}>↪</Text>
                            <Text style={styles.dropdownText}>Cerrar sesión</Text>
                        </TouchableOpacity>

                        {esAdmin && (
                            <>
                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity
                                    style={styles.dropdownOption}
                                    onPress={crearUsuario}
                                >
                                    <Text style={styles.dropdownIcon}>＋</Text>
                                    <Text style={styles.dropdownText}>Crear usuario</Text>
                                </TouchableOpacity>

                                <View style={styles.dropdownDivider} />
                                <TouchableOpacity
                                    style={styles.dropdownOption}
                                    onPress={crearCliente}
                                >
                                    <Text style={styles.dropdownIcon}>＋</Text>
                                    <Text style={styles.dropdownText}>Crear cliente</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

// =============================================================================
// ESTILOS RESPONSIVE CIM (ANDROID & WEB)
// =============================================================================
const styles = StyleSheet.create({
    // =========================================================================
    // 1. GENERAL Y CONTENEDORES BASE
    // =========================================================================
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F5F9',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 16,
        alignSelf: 'center',
    },
    containerWeb: {
        maxWidth: 1250,
        paddingHorizontal: 32,
    },

    // =========================================================================
    // 2. ENCABEZADO
    // =========================================================================
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 10,
    },
    headerBrand: {
        flex: 1,
        paddingRight: 8,
    },
    systemName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1E3A8A',
        letterSpacing: 1,
    },
    systemDescription: {
        fontSize: 11,
        color: '#8490A3',
        marginTop: 2,
    },
    statusSystem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 10,
        backgroundColor: '#16A34A',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803D',
    },

    // =========================================================================
    // 3. BIENVENIDA
    // =========================================================================
    welcome: {
        marginTop: 26,
        marginBottom: 20,
    },
    welcomeMobile: {
        marginTop: 16,
        marginBottom: 14,
    },
    welcomeTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#172033',
        letterSpacing: -0.7,
    },
    welcomeTitleMobile: {
        fontSize: 24,
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: '#778196',
        marginTop: 4,
        lineHeight: 19,
        maxWidth: 550,
    },

    // =========================================================================
    // 4. CONTENEDOR SUPERIOR (PERFIL + ACTIVIDADES)
    // =========================================================================
    topCardsWrapper: {
        flexDirection: 'column',
        gap: 14,
        marginBottom: 24,
    },
    topCardsWrapperWeb: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 18,
        marginBottom: 34,
    },

    // =========================================================================
    // 5. TARJETA DE PERFIL Y MODAL DE MENÚ
    // =========================================================================
    profileCard: {
        flex: 1.2,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        elevation: 2,
    },
    profileCardMobile: {
        flex: 0,
        padding: 14,
        gap: 12,
    },
    profileImage: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    profileImageMobile: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    profileInfo: {
        flex: 1,
    },
    profileLabel: {
        fontSize: 9.5,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.7,
        marginBottom: 3,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#172033',
    },
    profileRole: {
        fontSize: 12,
        color: '#8490A3',
        marginTop: 2,
    },
    profileIndicator: {
        width: 14,
        height: 14,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
    },
    menuButtonText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1D3557',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.25)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 140,
        paddingRight: 24,
    },
    dropdownMenuModal: {
        width: 195,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 6,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    dropdownIcon: {
        fontSize: 16,
        color: '#1D3557',
        width: 26,
    },
    dropdownText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
    },

    // =========================================================================
    // 6. TARJETA DE ACTIVIDADES PENDIENTES
    // =========================================================================
    activityCard: {
        flex: 1.5,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
    },
    activityCardMobile: {
        flex: 0,
        padding: 14,
    },
    activityTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    activityLabel: {
        fontSize: 10.5,
        color: '#8490A3',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    activityIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIconText: {
        color: '#D97706',
        fontSize: 14,
        fontWeight: '800',
    },
    activityLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    activityErrorText: {
        fontSize: 12,
        color: '#B91C1C',
        paddingVertical: 8,
    },
    activityGroupsContainer: {
        flexDirection: 'row',
        gap: 14,
    },
    activityGroupsMobile: {
        flexDirection: 'column',
        gap: 10,
    },
    activityGroup: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    activitySection: {
        fontSize: 10.5,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 0.8,
        marginBottom: 6,
        textAlign: 'center',
    },
    activityStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    activityStat: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#E2E8F0',
    },
    activityNumber: {
        fontSize: 22,
        color: '#1E3A8A',
        fontWeight: '800',
    },
    activityDescription: {
        fontSize: 11.5,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },

    // =========================================================================
    // 7. MÓDULOS DEL SISTEMA
    // =========================================================================
    modulesSection: {
        marginBottom: 28,
    },
    sectionHeader: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#172033',
    },
    sectionSubtitle: {
        fontSize: 12.5,
        color: '#8490A3',
        marginTop: 3,
    },
    modulesGrid: {
        flexDirection: 'column',
        gap: 16,
    },
    modulesGridWeb: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    moduleCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    moduleCardWeb: {
        flex: 1,
    },
    modulePressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    moduleImageContainer: {
        width: '100%',
        height: 155,
        position: 'relative',
        backgroundColor: '#E2E8F0',
    },
    moduleImage: {
        width: '100%',
        height: '100%',
    },
    moduleTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.80)',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 6,
    },
    moduleTagText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    moduleContent: {
        padding: 16,
        flex: 1,
        justifyContent: 'space-between',
    },
    moduleTextContainer: {
        marginBottom: 14,
    },
    moduleTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#172033',
        marginBottom: 4,
    },
    moduleDescription: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    moduleAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    moduleActionText: {
        fontSize: 13.5,
        fontWeight: '700',
        color: '#1E3A8A',
    },
    moduleArrow: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A8A',
    },

    // =========================================================================
    // 8. PIE DE PÁGINA
    // =========================================================================
    footer: {
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    footerTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1E3A8A',
        letterSpacing: 1,
    },
    footerText: {
        fontSize: 11.5,
        color: '#8490A3',
        marginTop: 3,
    },
    footerVersion: {
        fontSize: 10.5,
        color: '#94A3B8',
        marginTop: 2,
    },
});