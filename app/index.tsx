import { View, Text, Pressable } from 'react-native';
import { StyleSheet, Button, Alert, ScrollView, Platform, Image} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                  <Text>Bienvenido a CIM</Text>

                  <View style={styles.cards}>

                      <View style={styles.card}>
                          <View style={styles.Perfil}>
                              <Image style={styles.Perfil_img} source={require('../img/profile.png')}/>
                                  <View >
                                      <Text style={styles.Nombre}>Cristhian Salinas</Text>
                                      <Text style={styles.label}>Cargo</Text>
                                  </View>
                            </View>
                      </View>
                  
                      <View style={styles.card}>
                          <Text style={styles.number}>5</Text>
                          <Text style={styles.label}>Actividades pendientes</Text>
                      </View>
                
                    </View>

                <View style={styles.contenedor_botones}>
                    <Pressable style={styles.button_blue} onPress={() => router.push('/inventario')}>
                          <Image style={styles.img} source={require('../img/inventario.jpeg')}/>
                          <Text style={styles.buttontext}>Inventario</Text>
                    </Pressable>  

                    <Pressable style={styles.button_green} onPress={() => router.push('/movimientos')}>
                          <Image style={styles.img} source={require('../img/Movimientos.jpeg')}/>
                          <Text style={styles.buttontext}>Movimientos</Text>
                    </Pressable>
                </View>    
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },

  Perfil: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },  

  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },

  contenedor_botones: {
    alignItems: 'center',
    padding: 20,
  },

  buttontext: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  button_blue: {
    backgroundColor: '#0e4dd4',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },

  button_green: {
    backgroundColor: '#198924',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
        width: '100%',
    maxWidth: 500,
  },

  Nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: "nowrap",
  },

  Perfil_img: {
    width: 100,
    height: 100,
    resizeMode: "contain"
  },

  img: {
    width: 400,
    height: 200,
  },

  buttonCMS:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#111827',
    padding:15,
    borderRadius:10
  },

  number: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  label: {
    fontSize: 16,
    marginTop: 10,
  },
});