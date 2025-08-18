import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DashboardScreen from '../screens/DashboardScreen'
import MetricsScreen from '../screens/MetricsScreen'
import SharedTransactionsScreen from '../screens/SharedTransactionsScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator({ user }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Metrics') {
            iconName = focused ? 'analytics' : 'analytics-outline'
          } else if (route.name === 'Shared') {
            iconName = focused ? 'share' : 'share-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#2563eb',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        initialParams={{ user }}
        options={{
          title: 'SimplySpent',
          headerTitle: '💰 SimplySpent',
        }}
      />
      <Tab.Screen 
        name="Metrics" 
        component={MetricsScreen}
        initialParams={{ user }}
        options={{
          title: 'Analytics',
          headerTitle: '📊 Analytics',
        }}
      />
      <Tab.Screen 
        name="Shared" 
        component={SharedTransactionsScreen}
        initialParams={{ user }}
        options={{
          title: 'Shared',
          headerTitle: '📤 Shared',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        initialParams={{ user }}
        options={{
          title: 'Profile',
          headerTitle: '👤 Profile',
        }}
      />
    </Tab.Navigator>
  )
}
