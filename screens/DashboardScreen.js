import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator } from 'react-native-paper';
import { getExpenses } from '../services/api';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const DashboardScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyBudget] = useState(2000); // This should come from your budget settings

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // Calculate total spent
      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    // Group expenses by date and sum amounts
    const dailyTotals = expenses.reduce((acc, expense) => {
      const date = new Date(expense.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    return {
      labels: Object.keys(dailyTotals).slice(-7), // Last 7 days
      datasets: [{
        data: Object.values(dailyTotals).slice(-7),
      }],
    };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const chartData = getChartData();
  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Dashboard</Title>
      </View>

      {/* Budget Overview Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Budget</Title>
          <View style={styles.budgetContainer}>
            <View style={styles.budgetInfo}>
              <Paragraph>Total Spent</Paragraph>
              <Text style={styles.amount}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={styles.budgetInfo}>
              <Paragraph>Budget Limit</Paragraph>
              <Text style={styles.amount}>${monthlyBudget.toFixed(2)}</Text>
            </View>
            <View style={styles.budgetInfo}>
              <Paragraph>Remaining</Paragraph>
              <Text style={[
                styles.amount,
                { color: monthlyBudget - totalSpent < 0 ? '#ff4444' : '#4CAF50' }
              ]}>
                ${(monthlyBudget - totalSpent).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Spending Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Spending Trend</Title>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Transactions</Title>
          {expenses.slice(0, 5).map((expense) => (
            <View key={expense.id} style={styles.transaction}>
              <View>
                <Text style={styles.transactionName}>{expense.name}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>
                ${parseFloat(expense.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  budgetInfo: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen; 