import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function barra_navegacion() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bottomMenu}>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/')}
      >
        <Text style={styles.icon}>🏠</Text>
        <Text
          style={[
            styles.menuText,
            pathname === '/' && styles.activeText,
          ]}
        >
          Home
        </Text>
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.icon}>👤</Text>
        <Text
          style={[
            styles.menuText,
            pathname === '/login' && styles.activeText,
          ]}
        >
          Login
        </Text>
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/inventario')}
      >
        <Text style={styles.icon}>⚽</Text>
        <Text
          style={[
            styles.menuText,
            pathname === '/inventario' && styles.activeText,
          ]}
        >
          Inventario
        </Text>
      </Pressable>

    </View>
  );
}

export const styles = StyleSheet.create({
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingBottom: 20,
  },

  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },

  icon: {
    fontSize: 24,
    marginBottom: 4,
  },

  menuText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  activeText: {
    color: '#60A5FA',
    fontWeight: 'bold',
  },
});
