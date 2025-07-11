import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            // Pas de headerShown: false ici
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profil',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
