import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen name="(tabs)" options={{ title: 'Accueil' }} />
        <Drawer.Screen name="profile" options={{ title: 'Profil' }} />
        <Drawer.Screen name="settings" options={{ title: 'Paramètres' }} />
        {/* Add more Drawer.Screen as needed */}
      </Drawer>
    </GestureHandlerRootView>
  );
}
