import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../../constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#A1A1AA',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="eleves"
        options={{
          title: 'Élèves',
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
          title: 'Matières',
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
          title: 'Examens',
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
          title: 'Notes',
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

type TabBarIconProps = {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  focused: boolean;
};

const TabBarIcon = ({ name, color, focused }: TabBarIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[
      styles.iconContainer, 
      focused && styles.activeIconContainer,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <MaterialIcons 
        name={name} 
        size={24} 
        color={focused ? 'white' : color} 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 86,
    paddingBottom: 0,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});