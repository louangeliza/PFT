import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const user = JSON.parse(await AsyncStorage.getItem('user'));
    if (!user) {
      throw new Error('User not logged in');
    }
    // Add userId to the expense data
    const dataWithUserId = {
      ...expenseData,
      userId: user.id
    };
    console.log('Creating expense with data:', dataWithUserId);
    const response = await api.post('/expenses', dataWithUserId);
    return response.data;
  } catch (error) {
    console.error('Error in createExpense:', error);
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
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 