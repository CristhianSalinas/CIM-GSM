import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { useState, useRef } from 'react';


export default function Login() {
  const [usuario, setUsuario] = useState<string>('');
  const [contraseña, setContraseña] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  function ingresar() {
    console.log(usuario);
    console.log(contraseña);
  }

  return (
    <View>
      <form
        ref={formRef}
        onSubmit={(e: React.SyntheticEvent) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            email: { value: string };
            password: { value: string };
          };
          const email = target.email.value; // typechecks!
          const password = target.password.value; // typechecks!
          // etc...
        }}
      >
        <div>
          <label>
            Email:
            <input type="email" name="email" />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type="password" name="password" />
          </label>
        </div>
        <div>
          <input type="submit" value="Log in" />
        </div>
      </form>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#f2f2f2',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
});