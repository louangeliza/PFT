import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { FAB, List, Text, ActivityIndicator } from 'react-native-paper';
import { getExpenses, deleteExpense } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ route }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      console.log('Loading expenses...');
      const data = await getExpenses();
      console.log('Expenses loaded:', data);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      if (error.message === 'User not logged in') {
        await AsyncStorage.removeItem('user');
        navigation.replace('Login');
      } else {
        Alert.alert('Error', 'Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load expenses when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [])
  );

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      loadExpenses();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              setExpenses(expenses.filter(expense => expense.id !== id));
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (error) {
              console.error('Error deleting expense:', error);
              if (error.message === 'Unauthorized to delete this expense') {
                Alert.alert('Error', 'You are not authorized to delete this expense');
              } else {
                Alert.alert('Error', 'Failed to delete expense');
              }
            }
          },
        },
      ]
    );
  };

  const renderExpense = ({ item }) => (
    <List.Item
      title={item.name}
      description={`$${parseFloat(item.amount).toFixed(2)}`}
      left={props => <List.Icon {...props} icon="cash" />}
      right={props => (
        <IconButton
          {...props}
          icon="delete"
          size={20}
          onPress={() => handleDelete(item.id)}
        />
      )}
      onPress={() => navigation.navigate('ExpenseDetails', { expenseId: item.id })}
      style={styles.listItem}
    />
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
      <Text style={styles.title}>My Expenses</Text>
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
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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

export default HomeScreen; 