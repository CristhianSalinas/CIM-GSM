
import React from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    Image,
    Pressable,
    View,
    TouchableOpacity,
    TextInput
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
    finalizado
}) => {

    const cerrarModal = () => {
        setModalVisible(false);
        setNuevoConteo('');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={cerrarModal}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <View style={styles.header}>
                        <Text style={styles.modalText}>
                            Ingreso de mercancía
                        </Text>

                        <TouchableOpacity onPress={cerrarModal}>
                            <Text style={styles.close}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {productoSeleccionado && (
                        <>
                            <Text>Código: {productoSeleccionado.codigo_sm}</Text>

                            <Text style={styles.nombre}>
                                {productoSeleccionado.nombre}
                            </Text>

                            <Text style={styles.stock}>
                                Stock actual: {productoSeleccionado.cantidad_fisica}
                            </Text>

                            <Text style={styles.label}>
                                ¿Cuántas unidades ingresaron?
                            </Text>

                            <TextInput
                                    style={styles.input}
                                    value={nuevoConteo}
                                    onChangeText={setNuevoConteo}
                                    keyboardType="number-pad"
                                    placeholder="Cantidad ingresada"
                                    editable={!finalizado}
                                />

                            <View style={styles.containerButtons}>

                                <Pressable
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={cerrarModal}
                                >
                                    <Text style={styles.textStyle}>Cancelar</Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.button,
                                        styles.buttonConfirm,
                                        finalizado && { backgroundColor: '#9CA3AF' }
                                    ]}
                                    onPress={ingresarProducto}
                                    disabled={finalizado}
                                >
                                    <Image
                                        style={styles.logo}
                                        source={require('../../img/controlar.png')}
                                    />
                                </Pressable>

                            </View>
                        </>
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
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 5,
        width: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    close: {
        fontSize: 24,
        color: '#DC2626',
    },
    nombre: {
        fontSize: 17,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    stock: {
        color: '#2563EB',
        marginVertical: 10,
    },
    label: {
        marginTop: 15,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        textAlign: 'center',
        fontSize: 20,
    },
    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 25,
    },
    button: {
        borderRadius: 25,
        minWidth: 100,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    buttonClose: {
        backgroundColor: '#DC2626',
    },
    buttonConfirm: {
        backgroundColor: '#16A34A',
        width: 55,
    },
    logo: {
        width: 30,
        height: 35,
        resizeMode: 'contain',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CustomModal;
