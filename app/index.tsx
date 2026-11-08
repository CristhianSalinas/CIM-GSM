import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Platform,
    useWindowDimensions
} from 'react-native';

import {
    SafeAreaView,
    SafeAreaProvider
} from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

export default function Index() {

    const router = useRouter();

    const { width } = useWindowDimensions();

    const esWeb = Platform.OS === 'web';
    const esPantallaGrande = esWeb && width >= 768;

    return (

        <SafeAreaProvider>

            <SafeAreaView style={styles.safeArea}>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >

                    <View style={[
                        styles.container,
                        esPantallaGrande && styles.containerWeb
                    ]}>

                        {/* ENCABEZADO */}

                        <View style={styles.header}>

                            <View>
                                <Text style={styles.systemName}>
                                    CIM
                                </Text>

                                <Text style={styles.systemDescription}>
                                    Control de Inventarios y Movimientos
                                </Text>
                            </View>

                            <View style={styles.statusSystem}>
                                <View style={styles.statusDot} />

                                <Text style={styles.statusText}>
                                    Sistema activo
                                </Text>
                            </View>

                        </View>

                        {/* BIENVENIDA */}

                        <View style={styles.welcome}>

                            <Text style={styles.welcomeTitle}>
                                Bienvenido
                            </Text>

                            <Text style={styles.welcomeSubtitle}>
                                Administra y controla las operaciones de inventario desde un solo lugar.
                            </Text>

                        </View>

                        {/* PERFIL Y ACTIVIDADES */}

                        <View style={[
                            styles.cards,
                            !esPantallaGrande && styles.cardsMobile
                        ]}>

                            {/* PERFIL */}

                            <View style={[
                                styles.profileCard,
                                !esPantallaGrande && styles.profileCardMobile
                            ]}>

                                <Image
                                    style={styles.profileImage}
                                    source={require('../img/profile.png')}
                                />

                                <View style={styles.profileInfo}>

                                    <Text style={styles.profileLabel}>
                                        SESIÓN ACTIVA
                                    </Text>

                                    <Text style={styles.profileName}>
                                        Cristhian Salinas
                                    </Text>

                                    <Text style={styles.profileRole}>
                                        Encargado de inventarios
                                    </Text>

                                </View>

                                <View style={styles.profileIndicator}>
                                    <View style={styles.statusDot} />
                                </View>

                            </View>

                            </View>
                            
                            <View style={[
                            styles.cards,
                            !esPantallaGrande && styles.cardsMobile
                        ]}>
                            {/* ACTIVIDADES */}

                            <View style={[
                                styles.activityCard,
                                !esPantallaGrande && styles.activityCardMobile
                            ]}>

                                <View style={styles.activityTop}>

                                    <Text style={styles.activityLabel}>
                                        ACTIVIDADES PENDIENTES
                                    </Text>

                                    <View style={styles.activityIcon}>
                                        <Text style={styles.activityIconText}>
                                            !
                                        </Text>
                                    </View>

                                </View>

                                <Text style={styles.activityNumber}>
                                    5
                                </Text>

                                <Text style={styles.activityDescription}>
                                    Tareas por gestionar
                                </Text>

                            </View>

                        </View>

                        {/* MÓDULOS */}

                        <View style={styles.modulesSection}>

                            <View style={styles.sectionHeader}>

                                <View>
                                    <Text style={styles.sectionTitle}>
                                        Módulos del sistema
                                    </Text>

                                    <Text style={styles.sectionSubtitle}>
                                        Selecciona el módulo al que deseas ingresar.
                                    </Text>
                                </View>

                            </View>

                            <View style={[
                                styles.modulesGrid,
                                esPantallaGrande && styles.modulesGridWeb
                            ]}>

                                {/* INVENTARIO */}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.moduleCard,
                                        esPantallaGrande && styles.moduleCardWeb,
                                        pressed && styles.modulePressed
                                    ]}
                                    onPress={() => router.push('/inventario')}
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

                                            <Text style={styles.moduleArrow}>
                                                →
                                            </Text>
                                        </View>

                                    </View>

                                </Pressable>

                                {/* MOVIMIENTOS */}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.moduleCard,
                                        esPantallaGrande && styles.moduleCardWeb,
                                        pressed && styles.modulePressed
                                    ]}
                                    onPress={() => router.push('/movimientos')}
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

                                            <Text style={styles.moduleArrow}>
                                                →
                                            </Text>
                                        </View>

                                    </View>

                                </Pressable>

                            </View>

                        </View>

                        {/* PIE DE PÁGINA */}

                        <View style={styles.footer}>

                            <Text style={styles.footerTitle}>
                                CIM
                            </Text>

                            <Text style={styles.footerText}>
                                Sistema de gestión y control de inventarios
                            </Text>

                            <Text style={styles.footerVersion}>
                                Versión 1.0.0
                            </Text>

                        </View>

                    </View>

                </ScrollView>

            </SafeAreaView>

        </SafeAreaProvider>

    );
}


// ==========================================
// ESTILOS RESPONSIVE CIM
// ==========================================

const styles = StyleSheet.create({

    // GENERAL

    safeArea: {
        flex: 1,
        backgroundColor: '#F3F5F9'
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30
    },

    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 18,
        alignSelf: 'center'
    },

    containerWeb: {
        maxWidth: 1250,
        paddingHorizontal: 32
    },

    // ENCABEZADO

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },

    systemName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E3A8A',
        letterSpacing: 1
    },

    systemDescription: {
        fontSize: 10,
        color: '#8490A3',
        marginTop: 3
    },

    statusSystem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 7
    },

    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 10,
        backgroundColor: '#16A34A'
    },

    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D'
    },

    // BIENVENIDA

    welcome: {
        marginTop: 32,
        marginBottom: 24
    },

    welcomeTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#172033',
        letterSpacing: -0.7
    },

    welcomeSubtitle: {
        fontSize: 13,
        color: '#778196',
        marginTop: 7,
        lineHeight: 20,
        maxWidth: 550
    },

    // TARJETAS SUPERIORES

    cards: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 38
    },

    cardsMobile: {
        gap: 10
    },

    profileCard: {
        flex: 2,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        elevation: 1
    },

    profileCardMobile: {
        padding: 12,
        gap: 10
    },

    profileImage: {
        width: 75,
        height: 75,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#E2E8F0'
    },

    profileInfo: {
        flex: 1
    },

    profileLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.7,
        marginBottom: 6
    },

    profileName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#172033'
    },

    profileRole: {
        fontSize: 11,
        color: '#8490A3',
        marginTop: 5
    },

    profileIndicator: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center'
    },

    // ACTIVIDADES

    activityCard: {
        flex: 1,
        minWidth: 120,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        padding: 20,
        elevation: 1
    },

    activityCardMobile: {
        padding: 12
    },

    activityTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    activityLabel: {
        fontSize: 9,
        color: '#8490A3',
        fontWeight: '800',
        flex: 1
    },

    activityIcon: {
        width: 23,
        height: 23,
        borderRadius: 6,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center'
    },

    activityIconText: {
        color: '#D97706',
        fontSize: 15,
        fontWeight: '800'
    },

    activityNumber: {
        fontSize: 34,
        color: '#1E3A8A',
        fontWeight: '800',
        marginTop: 12
    },

    activityDescription: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 3
    },

    // MÓDULOS

    modulesSection: {
        marginBottom: 35
    },

    sectionHeader: {
        marginBottom: 18
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#172033'
    },

    sectionSubtitle: {
        fontSize: 12,
        color: '#8490A3',
        marginTop: 5
    },

    modulesGrid: {
        flexDirection: 'column',
        gap: 18
    },

    modulesGridWeb: {
        flexDirection: 'row',
        alignItems: 'stretch'
    },

    moduleCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2
    },

    moduleCardWeb: {
        flex: 1
    },

    modulePressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }]
    },

    moduleImageContainer: {
        width: '100%',
        height: 175,
        backgroundColor: '#E2E8F0',
        position: 'relative'
    },

    moduleImage: {
        width: '100%',
        height: '100%'
    },

    moduleTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 5
    },

    moduleTagText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5
    },

    moduleContent: {
        padding: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12
    },

    moduleTextContainer: {
        flex: 1
    },

    moduleTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#172033'
    },

    moduleDescription: {
        fontSize: 11,
        color: '#8490A3',
        lineHeight: 17,
        marginTop: 6
    },

    moduleAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#EFF4FF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 7
    },

    moduleActionText: {
        fontSize: 11,
        color: '#1E40AF',
        fontWeight: '800'
    },

    moduleArrow: {
        fontSize: 15,
        color: '#1E40AF',
        fontWeight: '800'
    },

    // PIE DE PÁGINA

    footer: {
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 18,
        alignItems: 'center'
    },

    footerTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: '#1E3A8A',
        letterSpacing: 1
    },

    footerText: {
        fontSize: 10,
        color: '#8490A3',
        marginTop: 5
    },

    footerVersion: {
        fontSize: 9,
        color: '#B0B8C5',
        marginTop: 5
    }

});
