import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry logic for 429 errors
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 429) {
    // Wait for 1 second before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    return api.request(error.config);
  }
  return Promise.reject(error);
});

export const loginUser = async (username, password) => {
  try {
    const response = await api.get('/users');
    const user = response.data.find(
      (user) => user.username === username && user.password === password
    );
    if (!user) {
      throw new Error('Invalid username or password');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const getExpenses = async () => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    if (!user) {
      throw new Error('User not logged in');
    }
    console.log('Current user:', user);
    
    const response = await api.get('/expenses');
    console.log('All expenses:', response.data);
    
    // Filter expenses for the current user
    const userExpenses = response.data.filter(expense => {
      console.log('Comparing expense.userId:', expense.userId, 'with user.id:', user.id);
      return expense.userId === user.id;
    });
    
    console.log('Filtered user expenses:', userExpenses);
    return userExpenses;
  } catch (error) {
    console.error('Error in getExpenses:', error);
    throw error;
  }
};

export const getExpenseById = async (id) => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    if (!user) {
      throw new Error('User not logged in');
    }
    const response = await api.get(`/expenses/${id}`);
    if (response.data.userId !== user.id) {
      throw new Error('Unauthorized access to expense');
    }
    return response.data;
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
    const userData = JSON.parse(user);
    
    const response = await api.post('/expenses', {
      ...expenseData,
      userId: userData.id, // Ensure userId is always set
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    if (!user) {
      throw new Error('User not logged in');
    }

    // First check if the expense belongs to the user
    const expense = await getExpenseById(id);
    if (expense.userId !== user.id) {
      throw new Error('Unauthorized to delete this expense');
    }

    // Add a small delay before making the delete request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again in a moment.');
    }
    throw error;
  }
};

export default api; 