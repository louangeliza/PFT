import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { createExpense, getExpenses } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { addExpenseNotification } from '../services/notifications';

const AddExpenseScreen = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(1000); // Default budget
  const [activeBudget, setActiveBudget] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
    loadActiveBudget();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, budget] = await Promise.all([
        getExpenses(),
        AsyncStorage.getItem('monthlyBudget')
      ]);
      setExpenses(expensesData);
      if (budget) {
        setMonthlyBudget(Number(budget));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadActiveBudget = async () => {
    try {
      const activeBudgetData = await AsyncStorage.getItem('activeBudget');
      if (activeBudgetData) {
        setActiveBudget(JSON.parse(activeBudgetData));
      }
    } catch (error) {
      console.error('Error loading active budget:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (!user) {
        throw new Error('User not logged in');
      }

      // Get the month and year of the expense
      const expenseMonth = date.getMonth();
      const expenseYear = date.getFullYear();
      const monthKey = `${expenseYear}-${String(expenseMonth + 1).padStart(2, '0')}`;

      // Load saved budgets
      const savedBudgets = await AsyncStorage.getItem('monthlyBudgets');
      const budgets = savedBudgets ? JSON.parse(savedBudgets) : [];
      
      // Find the budget for this month
      const monthBudget = budgets.find(b => b.month === monthKey);
      
      if (monthBudget) {
        // Check budget for this specific month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.createdAt);
          return expenseDate.getMonth() === expenseMonth && 
                 expenseDate.getFullYear() === expenseYear;
        });
        
        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const newExpenseAmount = parseFloat(amount);
        const totalWithNewExpense = monthlyTotal + newExpenseAmount;
        const budgetProgress = (totalWithNewExpense / monthBudget.amount) * 100;

        if (budgetProgress > 100) {
          Alert.alert(
            'Budget Exceeded',
            `Adding this expense would exceed your budget for ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Cannot add more expenses this month.`,
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
      }

      const expenseData = {
        name,
        amount: parseFloat(amount),
        description,
        createdAt: date.toISOString(),
        userId: user.id
      };

      console.log('Creating expense with data:', expenseData);
      const response = await createExpense(expenseData);
      console.log('Expense created successfully:', response);

      // If there's an active budget, add a notification
      if (activeBudget) {
        // Calculate current total based on budget type
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentAmount = 0;
        if (activeBudget.type === 'daily') {
          // For daily budget, only count today's expenses
          const todayExpenses = await getExpenses();
          currentAmount = todayExpenses
            .filter(expense => {
              const expenseDate = new Date(expense.createdAt);
              return expenseDate.getDate() === today.getDate() &&
                     expenseDate.getMonth() === today.getMonth() &&
                     expenseDate.getFullYear() === today.getFullYear();
            })
            .reduce((sum, expense) => sum + Number(expense.amount), 0);
        } else {
          // For monthly budget, count all expenses in current month
          const monthExpenses = await getExpenses();
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          currentAmount = monthExpenses
            .filter(expense => {
              const expenseDate = new Date(expense.createdAt);
              return expenseDate.getMonth() === currentMonth &&
                     expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + Number(expense.amount), 0);
        }

        // Add notification for the new expense
        await addExpenseNotification(
          {
            ...response,
            createdAt: new Date().toISOString() // Ensure valid date
          },
          currentAmount,
          activeBudget.amount,
          activeBudget.type
        );
      }

      Alert.alert(
        'Success',
        'Expense added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Expense</Text>
      
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        error={!!errors.name}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name}
      </HelperText>

      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.amount}
      />
      <HelperText type="error" visible={!!errors.amount}>
        {errors.amount}
      </HelperText>

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        error={!!errors.description}
      />
      <HelperText type="error" visible={!!errors.description}>
        {errors.description}
      </HelperText>

      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        {date.toLocaleDateString()}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      >
        Add Expense
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  dateButton: {
    marginVertical: 10,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default AddExpenseScreen; 