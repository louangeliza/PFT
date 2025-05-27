import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.example.com'; // Replace with your actual API URL

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (email, password) => {
  try {
    // For demo purposes, we'll use mock data
    // In a real app, this would be an API call
    if (email === 'demo@example.com' && password === 'password') {
      const mockUser = {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        token: 'mock-jwt-token',
      };
      return mockUser;
    }
    throw new Error('Invalid credentials');
  } catch (error) {
    throw error;
  }
};

// Expense functions
export const getExpenses = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    if (!user) {
      throw new Error('User not logged in');
    }
    const { id: userId } = JSON.parse(user);

    // For demo purposes, return mock data
    // In a real app, this would be an API call
    return [
      {
        id: '1',
        name: 'Groceries',
        amount: '150.00',
        description: 'Weekly groceries',
        createdAt: new Date().toISOString(),
        userId,
      },
      {
        id: '2',
        name: 'Rent',
        amount: '1200.00',
        description: 'Monthly rent',
        createdAt: new Date().toISOString(),
        userId,
      },
    ];
  } catch (error) {
    throw error;
  }
};

export const getExpenseById = async (id) => {
  try {
    const user = await AsyncStorage.getItem('user');
    if (!user) {
      throw new Error('User not logged in');
    }
    const { id: userId } = JSON.parse(user);

    // For demo purposes, return mock data
    // In a real app, this would be an API call
    const expense = {
      id,
      name: 'Sample Expense',
      amount: '100.00',
      description: 'Sample description',
      createdAt: new Date().toISOString(),
      userId,
    };

    if (expense.userId !== userId) {
      throw new Error('Unauthorized to view this expense');
    }

    return expense;
  } catch (error) {
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const user = await AsyncStorage.getItem('user');
    if (!user) {
      throw new Error('User not logged in');
    }
    const { id: userId } = JSON.parse(user);

    // For demo purposes, return mock data
    // In a real app, this would be an API call
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      createdAt: new Date().toISOString(),
      userId,
    };

    return newExpense;
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const user = await AsyncStorage.getItem('user');
    if (!user) {
      throw new Error('User not logged in');
    }
    const { id: userId } = JSON.parse(user);

    // For demo purposes, simulate API call
    // In a real app, this would be an API call
    return true;
  } catch (error) {
    throw error;
  }
};

export default api; 