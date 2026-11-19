
import React from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';

interface Props {
    visible: boolean;
    titulo?: string;
    mensaje?: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    onCancelar: () => void;
    onConfirmar: () => void;
}

export default function ModalConfirmacion({
    visible,
    titulo = '¿Estás seguro?',
    mensaje = '¿Seguro que quieres cancelar esta operación?',
    textoConfirmar = 'Sí, cancelar',
    textoCancelar = 'Volver',
    onCancelar,
    onConfirmar,
}: Props) {

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancelar}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    <Text style={styles.tituloModal}>
                        {titulo}
                    </Text>

                    <Text style={styles.mensajeModal}>
                        {mensaje}
                    </Text>

                    <View style={styles.botonesModal}>
                        <Pressable
                            style={styles.btnVolver}
                            onPress={onCancelar}
                        >
                            <Text style={styles.textoVolver}>
                                {textoCancelar}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.btnConfirmar}
                            onPress={onConfirmar}
                        >
                            <Text style={styles.textoConfirmar}>
                                {textoConfirmar}
                            </Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFF',
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 14,
    },
    tituloModal: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    mensajeModal: {
        textAlign: 'center',
        color: '#555',
        marginBottom: 24,
    },
    botonesModal: {
        flexDirection: 'row',
        gap: 10,
    },
    btnVolver: {
        flex: 1,
        padding: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        alignItems: 'center',
    },
    btnConfirmar: {
        flex: 1,
        padding: 12,
        backgroundColor: '#DC2626',
        borderRadius: 8,
        alignItems: 'center',
    },
    textoVolver: {
        color: '#000',
        fontWeight: '600',
    },
    textoConfirmar: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
