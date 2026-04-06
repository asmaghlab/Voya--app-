import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Plane, Building, User, Heart } from 'lucide-react-native';
import HomeScreen from '../../screens/HomeScreen';
import FlightsScreen from '../../screens/Flights/FlightsScreen';
import HotelsScreen from '../../screens/Hotels/HotelsScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import WishlistScreen from '../../screens/Wishlist/WishlistScreen';

const Tab = createBottomTabNavigator();

export default function MainLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Flights"
        component={FlightsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Plane color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Hotels"
        component={HotelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Building color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
