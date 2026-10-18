import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';


export default function pantalla_actual() {;
   const pathname = usePathname();

  useEffect(() => {
    console.log('Pantalla actual:', pathname);
  }, [pathname]);
  
  return <View />;
}

