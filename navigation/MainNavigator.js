import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AllExpensesScreen from '../screens/AllExpensesScreen';
import NotificationBell from '../components/NotificationBell';

const Tab = createBottomTabNavigator();

const MainNavigator = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'AllExpenses') {
            iconName = 'format-list-bulleted';
          } else if (route.name === 'Statistics') {
            iconName = 'chart-bar';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <NotificationBell
            onPress={() => navigation.navigate('Notifications')}
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Recent',
        }}
      />
      <Tab.Screen 
        name="AllExpenses" 
        component={AllExpensesScreen}
        options={{
          title: 'All Expenses',
        }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          title: 'Statistics',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 