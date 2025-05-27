import AsyncStorage from '@react-native-async-storage/async-storage';
import { USERS } from '../config';

export const register = async (username, password) => {
  try {
    // Check if username already exists
    const existingUser = USERS.find(user => user.username === username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create new user
    const newUser = {
      id: (USERS.length + 1).toString(),
      username,
      password,
      createdAt: new Date().toISOString()
    };

    // In a real app, you would save this to a database
    // For now, we'll just store it in AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const user = USERS.find(
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