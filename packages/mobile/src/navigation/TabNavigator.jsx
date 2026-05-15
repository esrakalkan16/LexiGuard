import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, FileStack, Library, User } from 'lucide-react-native';
import { theme } from '../theme/theme';

// Ekrans
import DashboardScreen from '../screens/DashboardScreen';
import AnalysesScreen from '../screens/AnalysesScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Panel') IconComponent = LayoutDashboard;
          else if (route.name === 'Analizler') IconComponent = FileStack;
          else if (route.name === 'Kütüphane') IconComponent = Library;
          else if (route.name === 'Profil') IconComponent = User;

          return <IconComponent size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          elevation: 0, // Android shadow disable to match iOS flat style
          shadowOpacity: 0.05, // iOS subtle shadow
          shadowOffset: { width: 0, height: -2 },
          height: 84, // Taller for iOS style
          paddingBottom: 24, // Padding for iPhone home indicator
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        }
      })}
    >
      <Tab.Screen name="Panel" component={DashboardScreen} />
      <Tab.Screen name="Analizler" component={AnalysesScreen} />
      <Tab.Screen name="Kütüphane" component={LibraryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
