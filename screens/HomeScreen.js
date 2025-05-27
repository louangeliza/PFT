import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { FAB, List, Text, ActivityIndicator, IconButton, Card, Title, Paragraph } from 'react-native-paper';
import { getExpenses, deleteExpense } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationBell from '../components/NotificationBell';
import { addBudgetAlert } from '../services/notifications';

const HomeScreen = ({ route }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(1000); // Default budget
  const [activeBudget, setActiveBudget] = useState(null);
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

  const getDisplayName = (email) => {
    if (!email) return 'User';
    // Get the part before @ and any special characters
    const username = email.split('@')[0].split(/[._-]/)[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const calculateTotals = useCallback((expenseList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let todaySum = 0;
    let monthSum = 0;

    expenseList.forEach(expense => {
      const expenseDate = new Date(expense.createdAt);
      const expenseAmount = Number(expense.amount) || 0;
      
      // Check if expense is from today
      if (expenseDate.getDate() === today.getDate() &&
          expenseDate.getMonth() === today.getMonth() &&
          expenseDate.getFullYear() === today.getFullYear()) {
        todaySum += expenseAmount;
      }
      
      // Check if expense is from current month
      if (expenseDate.getMonth() === currentMonth && 
          expenseDate.getFullYear() === currentYear) {
        monthSum += expenseAmount;
      }
    });

    console.log('Calculated totals:', { todaySum, monthSum });
    setTodayTotal(todaySum);
    setMonthlyTotal(monthSum);

    // Check budget threshold and add notification if needed
    if (activeBudget) {
      const budgetAmount = activeBudget.amount;
      const currentAmount = activeBudget.type === 'daily' ? todaySum : monthSum;
      addBudgetAlert(currentAmount, budgetAmount);
    }
  }, [activeBudget]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const activeBudgetData = await AsyncStorage.getItem('activeBudget');
      if (activeBudgetData) {
        const budget = JSON.parse(activeBudgetData);
        setActiveBudget(budget);
        setMonthlyBudget(budget.amount);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      console.log('Loading expenses...');
      const data = await getExpenses();
      console.log('Expenses loaded:', data);
      
      // Filter expenses for today only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayExpenses = data.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate.getDate() === today.getDate() &&
               expenseDate.getMonth() === today.getMonth() &&
               expenseDate.getFullYear() === today.getFullYear();
      });
      
      setExpenses(todayExpenses);
      calculateTotals(data); // Still calculate totals from all expenses
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

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadExpenses();
    }, [])
  );

  useEffect(() => {
    if (route.params?.refresh) {
      loadExpenses();
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NotificationBell
          onPress={() => navigation.navigate('Notifications')}
        />
      ),
    });
  }, [navigation, user]);

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
              setLoading(true);
              await deleteExpense(id);
              const updatedExpenses = expenses.filter(expense => expense.id !== id);
              setExpenses(updatedExpenses);
              calculateTotals(updatedExpenses);
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (error) {
              console.error('Error deleting expense:', error);
              if (error.message.includes('Too many requests')) {
                Alert.alert(
                  'Rate Limit Exceeded',
                  'Please wait a moment before trying again.',
                  [{ text: 'OK' }]
                );
              } else if (error.message === 'Unauthorized to delete this expense') {
                Alert.alert('Error', 'You are not authorized to delete this expense');
              } else {
                Alert.alert('Error', 'Failed to delete expense. Please try again.');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  const budgetProgress = activeBudget ? 
    (activeBudget.type === 'daily' ? 
      (todayTotal / activeBudget.amount) * 100 : 
      (monthlyTotal / activeBudget.amount) * 100) : 0;
  
  const budgetColor = budgetProgress >= 100 ? '#ff4444' : budgetProgress >= 90 ? '#ffbb33' : '#00C851';
  
  const getBudgetMessage = () => {
    if (!activeBudget) return null;
    
    const budgetType = activeBudget.type === 'daily' ? 'daily' : 'monthly';
    const currentAmount = activeBudget.type === 'daily' ? todayTotal : monthlyTotal;
    
    if (budgetProgress >= 100) {
      return `⚠️ You have exceeded your ${budgetType} budget!`;
    } else if (budgetProgress >= 90) {
      return `⚠️ You are very close to your ${budgetType} budget!`;
    } else if (budgetProgress >= 80) {
      return `⚠️ You are approaching your ${budgetType} budget`;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Today's Spending</Title>
              <Paragraph style={styles.amountText}>
                ${formatAmount(todayTotal)}
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>{activeBudget ? `${activeBudget.type === 'daily' ? 'Daily' : 'Monthly'} Budget` : 'Monthly Budget'}</Title>
              <Paragraph style={styles.amountText}>
                ${formatAmount(activeBudget ? (activeBudget.type === 'daily' ? todayTotal : monthlyTotal) : monthlyTotal)} / ${formatAmount(activeBudget ? activeBudget.amount : monthlyBudget)}
              </Paragraph>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(budgetProgress, 100)}%`, backgroundColor: budgetColor }
                  ]} 
                />
              </View>
              {getBudgetMessage() && (
                <Text style={[styles.warningText, { color: budgetColor }]}>
                  {getBudgetMessage()}
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {expenses.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.noExpenses}>No expenses made recently</Text>
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
            scrollEnabled={false}
          />
        )}
      </ScrollView>
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
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningText: {
    marginTop: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
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
  expenseAmount: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    textAlign: 'center',
  },
  addExpenseHint: {
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen; 