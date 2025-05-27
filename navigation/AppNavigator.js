import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          elevation: 8,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check for stored user data when app starts
    const bootstrapAsync = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUserToken(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={userToken ? "Main" : "Login"}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: 'Expense Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 