import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="eleves"
        options={{
          title: 'Students',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="person" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="matieres"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="menu-book" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="examens"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="assignment" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Grades',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="grade" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const TabBarIcon = ({ name, color, focused }: { name: string, color: string, focused: boolean }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
      <MaterialIcons 
        name={name as any} 
        size={24} 
        color={focused ? 'white' : color} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  activeIconContainer: {
    backgroundColor: colors.primary,
  },
});