import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button, List, IconButton, SegmentedButtons } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const BudgetsScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [budgetType, setBudgetType] = useState('monthly');
  const [activeBudget, setActiveBudget] = useState(null);

  useEffect(() => {
    loadBudgets();
    loadActiveBudget();
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

  const loadActiveBudget = async () => {
    try {
      const active = await AsyncStorage.getItem('activeBudget');
      if (active) {
        setActiveBudget(JSON.parse(active));
      }
    } catch (error) {
      console.error('Error loading active budget:', error);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const currentDate = new Date();
      currentDate.setDate(1);
      currentDate.setHours(0, 0, 0, 0);

      const selectedDate = new Date(date);
      selectedDate.setDate(1);
      selectedDate.setHours(0, 0, 0, 0);

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

      const budgetData = {
        month: monthKey,
        amount: parseFloat(newBudget),
        type: budgetType,
        createdAt: new Date().toISOString()
      };

      const updatedBudgets = [...budgets];
      const existingIndex = updatedBudgets.findIndex(b => b.month === monthKey && b.type === budgetType);

      if (existingIndex >= 0) {
        updatedBudgets[existingIndex] = budgetData;
      } else {
        updatedBudgets.push(budgetData);
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

  const handleSetActiveBudget = async (budget) => {
    try {
      await AsyncStorage.setItem('activeBudget', JSON.stringify(budget));
      setActiveBudget(budget);
      Alert.alert('Success', 'Active budget updated');
    } catch (error) {
      console.error('Error setting active budget:', error);
      Alert.alert('Error', 'Failed to set active budget');
    }
  };

  const handleDeleteBudget = async (monthKey, type) => {
    try {
      const updatedBudgets = budgets.filter(b => !(b.month === monthKey && b.type === type));
      await AsyncStorage.setItem('monthlyBudgets', JSON.stringify(updatedBudgets));
      setBudgets(updatedBudgets);
      
      // If the deleted budget was active, clear the active budget
      if (activeBudget && activeBudget.month === monthKey && activeBudget.type === type) {
        await AsyncStorage.removeItem('activeBudget');
        setActiveBudget(null);
      }
      
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
          <Text style={styles.title}>Set Budget</Text>
          
          <SegmentedButtons
            value={budgetType}
            onValueChange={setBudgetType}
            buttons={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'daily', label: 'Daily' }
            ]}
            style={styles.segmentedButtons}
          />

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
              minimumDate={new Date()}
            />
          )}

          <TextInput
            label={`${budgetType === 'daily' ? 'Daily' : 'Monthly'} Budget Amount`}
            value={newBudget}
            onChangeText={setNewBudget}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            placeholder={`Enter ${budgetType} budget amount`}
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
                  key={`${budget.month}-${budget.type}`}
                  title={`${formatMonth(budget.month)} (${budget.type})`}
                  description={`$${budget.amount.toFixed(2)} ${budget.type === 'daily' ? 'per day' : 'per month'}`}
                  right={props => (
                    <View style={styles.budgetActions}>
                      <IconButton
                        {...props}
                        icon={activeBudget && activeBudget.month === budget.month && activeBudget.type === budget.type ? "check-circle" : "circle-outline"}
                        onPress={() => handleSetActiveBudget(budget)}
                      />
                      <IconButton
                        {...props}
                        icon="delete"
                        onPress={() => handleDeleteBudget(budget.month, budget.type)}
                      />
                    </View>
                  )}
                  style={[
                    styles.budgetItem,
                    activeBudget && activeBudget.month === budget.month && activeBudget.type === budget.type && styles.activeBudget
                  ]}
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
  segmentedButtons: {
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
  activeBudget: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noBudgets: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
});

export default BudgetsScreen; 