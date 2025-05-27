import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="Login"
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        listeners={{
          focus: () => {
            console.log('Login screen focused');
          }
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        listeners={{
          focus: () => {
            console.log('Register screen focused');
          }
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 