import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, IconButton, Text } from 'react-native-paper';
import { getExpenses, deleteExpense } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      Alert.alert('Success', 'Expense deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete expense');
    }
  };

  const renderExpense = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.title}</Title>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item.id)}
          />
        </View>
        <Paragraph>Amount: ${item.amount}</Paragraph>
        <Paragraph>Category: {item.category}</Paragraph>
        <Paragraph>Date: {new Date(item.date).toLocaleDateString()}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Expenses</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={loadExpenses}
        contentContainerStyle={styles.list}
      />
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 