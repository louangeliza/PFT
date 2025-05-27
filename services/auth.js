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
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    console.log('Attempting login with:', { username, password });
    
    const response = await axios.get(`${API_URL}/users`);
    console.log('API Response:', response.data);
    
    const users = response.data;
    console.log('Total users found:', users.length);
    
    const user = users.find(
      u => u.username === username && u.password === password
    );
    
    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user.id,
        username: user.username,
        // Don't log the password for security
      });
    }

    if (!user) {
      console.log('Login failed: Invalid credentials');
      throw new Error('Invalid credentials');
    }

    await AsyncStorage.setItem('user', JSON.stringify(user));
    console.log('Login successful, user stored in AsyncStorage');
    return user;
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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