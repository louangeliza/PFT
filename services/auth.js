import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const register = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const user = await response.json();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}; 