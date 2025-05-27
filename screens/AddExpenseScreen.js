import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { createExpense } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddExpenseScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!category.trim()) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const expenseData = {
        title,
        amount: parseFloat(amount),
        category,
        date: date.toISOString(),
      };

      await createExpense(expenseData);
      Alert.alert('Success', 'Expense added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add expense');
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
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
        error={!!errors.title}
      />
      <HelperText type="error" visible={!!errors.title}>
        {errors.title}
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
        label="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
        mode="outlined"
        error={!!errors.category}
      />
      <HelperText type="error" visible={!!errors.category}>
        {errors.category}
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