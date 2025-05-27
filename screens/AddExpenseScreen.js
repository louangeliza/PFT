import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { createExpense } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddExpenseScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

      const expenseData = {
        name,
        amount: parseFloat(amount).toFixed(2),
        description,
        createdAt: date.toISOString(),
        userId: user.id
      };

      console.log('Creating expense with data:', expenseData);
      const response = await createExpense(expenseData);
      console.log('Expense created successfully:', response);

      Alert.alert(
        'Success',
        'Expense added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { refresh: true })
          }
        ]
      );
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to add expense. Please try again.'
      );
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