import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { List, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { getExpenses, deleteExpense } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AllExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const formatAmount = (amount) => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
      return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      // Sort expenses by date, most recent first
      const sortedExpenses = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      if (error.message === 'User not logged in') {
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteExpense(id);
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (error.message.includes('Too many requests')) {
        Alert.alert(
          'Rate Limit Exceeded',
          'Please wait a moment before trying again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to delete expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}
      style={styles.listItem}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemLeft}>
          <List.Icon icon="cash" />
          <View>
            <Text style={styles.expenseName}>{item.name}</Text>
            <Text style={styles.expenseDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.expenseAmount}>${formatAmount(item.amount)}</Text>
          </View>
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => handleDelete(item.id)}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {expenses.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noExpenses}>No expenses found</Text>
          <Text style={styles.addExpenseHint}>Tap the + button to add an expense</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={loadExpenses}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 8,
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noExpenses: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addExpenseHint: {
    color: '#666',
    textAlign: 'center',
  },
});

export default AllExpensesScreen; 