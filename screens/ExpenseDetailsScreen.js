import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { getExpenseById, deleteExpense } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const ExpenseDetailsScreen = () => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { expenseId } = route.params;

  const formatAmount = (amount) => {
    try {
      // Handle string or number input
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
      return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  useEffect(() => {
    loadExpenseDetails();
  }, [expenseId]);

  const loadExpenseDetails = async () => {
    try {
      setLoading(true);
      const data = await getExpenseById(expenseId);
      setExpense(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expense details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
              await deleteExpense(expenseId);
              Alert.alert('Success', 'Expense deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.centered}>
        <Paragraph>Expense not found</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{expense.name}</Title>
          
          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Amount:</Paragraph>
            <Paragraph style={styles.value}>${formatAmount(expense.amount)}</Paragraph>
          </View>

          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Description:</Paragraph>
            <Paragraph style={styles.value}>{expense.description}</Paragraph>
          </View>

          <View style={styles.detailRow}>
            <Paragraph style={styles.label}>Date Created:</Paragraph>
            <Paragraph style={styles.value}>
              {new Date(expense.createdAt).toLocaleString()}
            </Paragraph>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
            >
              Delete Expense
            </Button>
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
});

export default ExpenseDetailsScreen; 