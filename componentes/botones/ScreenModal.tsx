import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    Image,
    Pressable,
    View,
    TouchableOpacity,
    TextInput,
    Platform,
} from 'react-native';
import { Producto } from '../../types/Producto';

interface CustomModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    productoSeleccionado: Producto | null;
    nuevoConteo: string;
    setNuevoConteo: (valor: string) => void;
    ingresarProducto: () => void;
    finalizado: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
    modalVisible,
    setModalVisible,
    productoSeleccionado,
    nuevoConteo,
    setNuevoConteo,
    ingresarProducto,
    finalizado,
}) => {
    const cerrarModal = () => {
        setModalVisible(false);
        setNuevoConteo('');
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={cerrarModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.modalText}>
                            Movimiento de mercancía
                        </Text>

                        <TouchableOpacity
                            onPress={cerrarModal}
                            style={styles.botonCerrar}
                            hitSlop={8}
                        >
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {productoSeleccionado && (
                        <View style={styles.contenido}>
                            {/* TARJETA DE INFORMACIÓN DEL PRODUCTO */}
                            <View style={styles.productoCard}>
                                <View style={styles.filaSuperiorProducto}>
                                    <View style={styles.pillCodigo}>
                                        <Text style={styles.textoCodigo}>
                                            {productoSeleccionado.codigo_sm}
                                        </Text>
                                    </View>

                                    <View style={styles.pillStock}>
                                        <Text style={styles.textoStock}>
                                            Stock actual: {productoSeleccionado.cantidad_fisica}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.nombre}>
                                    {productoSeleccionado.nombre}
                                </Text>
                            </View>

                            {/* CAMPO DE CANTIDAD */}
                            <Text style={styles.label}>
                                Cantidad a registrar
                            </Text>

                            <TextInput
                                style={[
                                    styles.input,
                                    finalizado && styles.inputDeshabilitado,
                                ]}
                                value={nuevoConteo}
                                onChangeText={setNuevoConteo}
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor="#94A3B8"
                                editable={!finalizado}
                            />

                            {/* BOTONES DE ACCIÓN */}
                            <View style={styles.containerButtons}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        styles.buttonClose,
                                        pressed && { opacity: 0.7 },
                                    ]}
                                    onPress={cerrarModal}
                                >
                                    <Text style={styles.textoCancelar}>Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        styles.buttonConfirm,
                                        finalizado && styles.buttonDeshabilitado,
                                        pressed && !finalizado && { opacity: 0.88 },
                                    ]}
                                    onPress={ingresarProducto}
                                    disabled={finalizado}
                                >
                                    <Image
                                        style={styles.logo}
                                        source={require('../../img/controlar.png')}
                                    />
                                    <Text style={styles.textoConfirmar}>Confirmar</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        padding: 16,
    },

    modalView: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 420,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: 16,
    },

    modalText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
    },

    botonCerrar: {
        backgroundColor: '#F1F5F9',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    close: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },

    contenido: {
        width: '100%',
    },

    productoCard: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },

    filaSuperiorProducto: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },

    pillCodigo: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },

    textoCodigo: {
        color: '#334155',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 11.5,
    },

    pillStock: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },

    textoStock: {
        color: '#1D4ED8',
        fontSize: 11.5,
        fontWeight: '600',
    },

    nombre: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        lineHeight: 20,
    },

    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },

    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        height: 50,
        paddingHorizontal: 14,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
    },

    inputDeshabilitado: {
        backgroundColor: '#F1F5F9',
        color: '#94A3B8',
    },

    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 22,
    },

    button: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 8,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
        gap: 8,
    },

    buttonClose: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },

    textoCancelar: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 13,
    },

    buttonConfirm: {
        backgroundColor: '#1E293B',
    },

    buttonDeshabilitado: {
        backgroundColor: '#94A3B8',
    },

    logo: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
    },

    textoConfirmar: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 13,
    },
});

export default CustomModal;