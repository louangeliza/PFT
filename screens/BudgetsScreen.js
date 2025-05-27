import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button, List, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const BudgetsScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const savedBudgets = await AsyncStorage.getItem('monthlyBudgets');
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      // Get current date and set it to the first day of the month
      const currentDate = new Date();
      currentDate.setDate(1);
      currentDate.setHours(0, 0, 0, 0);

      // Set the selected date to the first day of the month
      const selectedDate = new Date(date);
      selectedDate.setDate(1);
      selectedDate.setHours(0, 0, 0, 0);

      // Only allow current and future months
      if (selectedDate >= currentDate) {
        setSelectedMonth(date);
      } else {
        Alert.alert(
          'Invalid Date',
          'You can only set budgets for the current month and future months.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget || isNaN(newBudget) || parseFloat(newBudget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if the selected month is in the past
      const currentDate = new Date();
      currentDate.setDate(1);
      currentDate.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(selectedMonth);
      selectedDate.setDate(1);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < currentDate) {
        Alert.alert(
          'Invalid Date',
          'You can only set budgets for the current month and future months.',
          [{ text: 'OK' }]
        );
        return;
      }

      const updatedBudgets = [...budgets];
      const existingIndex = updatedBudgets.findIndex(b => b.month === monthKey);

      if (existingIndex >= 0) {
        updatedBudgets[existingIndex].amount = parseFloat(newBudget);
      } else {
        updatedBudgets.push({
          month: monthKey,
          amount: parseFloat(newBudget)
        });
      }

      await AsyncStorage.setItem('monthlyBudgets', JSON.stringify(updatedBudgets));
      setBudgets(updatedBudgets);
      setNewBudget('');
      Alert.alert('Success', 'Budget updated successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (monthKey) => {
    try {
      const updatedBudgets = budgets.filter(b => b.month !== monthKey);
      await AsyncStorage.setItem('monthlyBudgets', JSON.stringify(updatedBudgets));
      setBudgets(updatedBudgets);
      Alert.alert('Success', 'Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      Alert.alert('Error', 'Failed to delete budget');
    }
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Set Monthly Budget</Text>
          
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={selectedMonth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()} // Set minimum date to current date
            />
          )}

          <TextInput
            label="Budget Amount"
            value={newBudget}
            onChangeText={setNewBudget}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            placeholder="Enter budget amount"
          />

          <Button
            mode="contained"
            onPress={handleAddBudget}
            style={styles.button}
          >
            Set Budget
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Saved Budgets</Text>
          {budgets.length === 0 ? (
            <Text style={styles.noBudgets}>No budgets set</Text>
          ) : (
            budgets
              .sort((a, b) => a.month.localeCompare(b.month))
              .map((budget) => (
                <List.Item
                  key={budget.month}
                  title={formatMonth(budget.month)}
                  description={`$${budget.amount.toFixed(2)}`}
                  right={props => (
                    <IconButton
                      {...props}
                      icon="delete"
                      onPress={() => handleDeleteBudget(budget.month)}
                    />
                  )}
                  style={styles.budgetItem}
                />
              ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  budgetItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
  },
  noBudgets: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
});

export default BudgetsScreen; 