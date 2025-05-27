import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator();

const AuthNavigator = ({ navigation, route }) => {
  // Get the onLogin callback from the parent navigator
  const onLogin = route.params?.onLogin;
  
  console.log('AuthNavigator - onLogin callback:', onLogin ? 'present' : 'missing');

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
        initialParams={{ onLogin }}
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