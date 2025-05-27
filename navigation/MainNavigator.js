import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton, Text } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AllExpensesScreen from '../screens/AllExpensesScreen';
import NotificationBell from '../components/NotificationBell';
import BudgetsScreen from '../screens/BudgetsScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'All Expenses':
              iconName = 'format-list-bulleted';
              break;
            case 'Statistics':
              iconName = 'chart-bar';
              break;
            case 'Budgets':
              iconName = 'wallet';
              break;
            case 'Profile':
              iconName = 'account';
              break;
          }

          return <IconButton icon={iconName} size={size} iconColor={color} />;
        },
        tabBarActiveTintColor: '#00BCD4',
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
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#00BCD4',
        }}
      />
      <Tab.Screen 
        name="All Expenses" 
        component={AllExpensesScreen}
        options={{
          title: 'All Expenses',
          tabBarLabel: 'All Expenses'
        }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{
          title: 'Statistics',
          tabBarLabel: 'Statistics'
        }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetsScreen}
        options={{
          title: 'Budgets',
          tabBarLabel: 'Budgets'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 