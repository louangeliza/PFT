import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

export const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/users`, {
      username,
      password,
      createdAt: new Date().toISOString()
    });
    
    const userData = response.data;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    const users = response.data;
    
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    return user;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response?.status === 404) {
      throw new Error('Service unavailable. Please try again later.');
    }
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout');
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