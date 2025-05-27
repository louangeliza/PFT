import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Text, ActivityIndicator } from 'react-native-paper';
import { getExpenses } from '../services/api';
import { PieChart, LineChart } from 'react-native-chart-kit';

const AnalyticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // Process data for charts
      processCategoryData(data);
      processMonthlyData(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCategoryData = (data) => {
    // Group expenses by category and sum amounts
    const categoryTotals = data.reduce((acc, expense) => {
      const category = expense.description || 'Uncategorized';
      acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    // Convert to array format for PieChart
    const pieData = Object.entries(categoryTotals).map(([name, amount], index) => ({
      name,
      amount,
      color: getColorForIndex(index),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

    setCategoryData(pieData);
  };

  const processMonthlyData = (data) => {
    // Group expenses by month and sum amounts
    const monthlyTotals = data.reduce((acc, expense) => {
      const date = new Date(expense.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});

    // Convert to array format for LineChart
    const lineData = {
      labels: Object.keys(monthlyTotals),
      datasets: [{
        data: Object.values(monthlyTotals),
      }],
    };

    setMonthlyData(lineData);
  };

  const getColorForIndex = (index) => {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Analytics</Title>
      </View>

      {/* Spending by Category */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Spending by Category</Title>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={styles.noData}>No category data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Monthly Spending Trend */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Spending Trend</Title>
          {monthlyData.labels?.length > 0 ? (
            <LineChart
              data={monthlyData}
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
          ) : (
            <Text style={styles.noData}>No monthly data available</Text>
          )}
        </Card.Content>
      </Card>

      {/* Summary Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Summary</Title>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryValue}>
                ${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average Expense</Text>
              <Text style={styles.summaryValue}>
                ${(expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) / 
                  (expenses.length || 1)).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Number of Expenses</Text>
              <Text style={styles.summaryValue}>{expenses.length}</Text>
            </View>
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnalyticsScreen; 