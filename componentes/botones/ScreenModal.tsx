import React from 'react';
import { Alert, Modal, StyleSheet, Text, Image, Pressable, View } from 'react-native';

interface Producto {
  id: number;
  codigo: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  estado: 'Disponible' | 'Agotado';
}

interface CustomModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  productoSeleccionado: Producto | null;
}

const CustomModal: React.FC<CustomModalProps> = ({ modalVisible, setModalVisible,  productoSeleccionado }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          <Text style={styles.modalText}>¿Es correcta la cantidad del producto seleccionado?</Text>
          
          <Text>Código: {productoSeleccionado?.codigo}</Text>

          <Text>Nombre: {productoSeleccionado?.nombre}</Text>

          <Text>Categoría: {productoSeleccionado?.categoria}</Text>

          <Text>Cantidad: {productoSeleccionado?.cantidad}</Text>

          <View style={styles.containerButtons}>

              <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(false)}>
                    {/*<Text style={styles.textStyle}>✕</Text>*/}
                    <Image style={styles.logo} source={require('../../img/no_correcto.png')}/>
              </Pressable>

            <Pressable
                style={[styles.button, styles.buttonConfirm]}
                onPress={() => {
                  console.log("Confirmado");
                  setModalVisible(false);
                }}>
                  <Image style={styles.logo} source={require('../../img/controlar.png')}/>
              {/* <Text style={styles.textStyle}>✓</Text>*/}
            </Pressable>
          </View>

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
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  logo: {
    width: 36,
    height: 48,
    resizeMode: "contain"
  },

  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  containerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#ff5252',
  },
  buttonConfirm: {
    backgroundColor: '#4caf50',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default CustomModal;