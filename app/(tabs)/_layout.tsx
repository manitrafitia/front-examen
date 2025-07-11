import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
// import colors from '../../constants/config';
import { colors } from '../../constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="eleves"
        options={{
          title: 'Élèves',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matieres"
        options={{
          title: 'Matières',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="menu-book" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="examens"
        options={{
          title: 'Examens',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assignment" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="grade" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}