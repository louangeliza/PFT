import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { login } from '../services/auth';

const LoginScreen = ({ navigation, route }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('Login attempt with:', { username, password });
    
    if (!username || !password) {
      console.log('Login validation failed: Empty fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling login service...');
      const user = await login(username, password);
      console.log('Login successful, user:', user);
      
      // Call the onLogin callback from route params
      if (route.params?.onLogin) {
        console.log('Calling onLogin callback');
        route.params.onLogin(user);
      } else {
        console.error('No onLogin callback found');
        Alert.alert('Error', 'Navigation failed. Please try again.');
      }
    } catch (error) {
      console.error('Login screen error:', error);
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        label="Username"
        value={username}
        onChangeText={(text) => {
          console.log('Username changed:', text);
          setUsername(text);
        }}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          console.log('Password changed:', text.length, 'characters');
          setPassword(text);
        }}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Register')}
        style={styles.link}
      >
        Don't have an account? Register
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  link: {
    marginTop: 16,
  },
});

export default LoginScreen;
