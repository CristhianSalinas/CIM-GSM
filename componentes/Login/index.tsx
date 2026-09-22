import { View, Text, TextInput, Button } from 'react-native';
import { useState, useRef } from 'react';


import { styles } from './style';

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