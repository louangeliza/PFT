import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MainNavigator from './MainNavigator';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
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
          component={MainNavigator}
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
    </NavigationContainer>
  );
};

export default AppNavigator; 