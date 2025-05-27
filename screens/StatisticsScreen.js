import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getExpenses } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StatisticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  const formatAmount = (amount) => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
      return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // Process data for charts
      processChartData(data);
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

  const processChartData = async (expenseData) => {
    try {
      // Load saved budgets
      const savedBudgets = await AsyncStorage.getItem('monthlyBudgets');
      const budgets = savedBudgets ? JSON.parse(savedBudgets) : [];

      // Process monthly data
      const monthlyExpenses = {};
      const dailyExpenses = {};
      const categoryExpenses = {};

      // Initialize months with budgets
      budgets.forEach(budget => {
        monthlyExpenses[budget.month] = 0;
      });

      // Add expenses to their respective months
      expenseData.forEach(expense => {
        try {
          const date = new Date(expense.createdAt);
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', expense.createdAt);
            return;
          }

          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          const category = expense.category || expense.name || 'Uncategorized';

          // Monthly data
          monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + Number(expense.amount);
          
          // Daily data
          dailyExpenses[dayKey] = (dailyExpenses[dayKey] || 0) + Number(expense.amount);
          
          // Category data
          categoryExpenses[category] = (categoryExpenses[category] || 0) + Number(expense.amount);
        } catch (error) {
          console.error('Error processing expense:', error, expense);
        }
      });

      // Convert to arrays for charts
      const monthlyChartData = Object.entries(monthlyExpenses)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => {
          const [year, monthNum] = month.split('-');
          const date = new Date(year, parseInt(monthNum) - 1);
          const budget = budgets.find(b => b.month === month);
          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            amount: amount,
            budget: budget ? budget.amount : null
          };
        });

      // Get last 7 days of data
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyChartData = last7Days.map(dayKey => ({
        day: new Date(dayKey).toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dailyExpenses[dayKey] || 0
      }));

      // Process category data
      const categoryChartData = Object.entries(categoryExpenses)
        .filter(([_, amount]) => amount > 0) // Only include categories with expenses
        .sort(([_, a], [__, b]) => b - a) // Sort by amount descending
        .map(([category, amount], index) => ({
          name: category,
          amount: amount,
          color: getRandomColor(index),
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }));

      setMonthlyData(monthlyChartData);
      setDailyData(dailyChartData);
      setCategoryData(categoryChartData);
    } catch (error) {
      console.error('Error processing chart data:', error);
    }
  };

  const getRandomColor = (index) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Daily Spending (Last 7 Days)</Text>
          {dailyData.length > 0 ? (
            <LineChart
              data={{
                labels: dailyData.map(d => d.day),
                datasets: [{
                  data: dailyData.map(d => d.amount)
                }]
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                ...chartConfig,
                formatYLabel: (value) => `$${value}`,
              }}
              style={styles.chart}
              bezier
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero
            />
          ) : (
            <Text style={styles.noDataText}>No spending data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
          {monthlyData.length > 0 ? (
            <LineChart
              data={{
                labels: monthlyData.map(m => m.month),
                datasets: [{
                  data: monthlyData.map(m => m.amount),
                  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                },
                {
                  data: monthlyData.map(m => m.budget),
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                }]
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                ...chartConfig,
                formatYLabel: (value) => `$${value}`,
              }}
              style={styles.chart}
              bezier
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero
            />
          ) : (
            <Text style={styles.noDataText}>No monthly data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No category data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Spending Insights</Text>
          {dailyData.length > 0 ? (
            <>
              <Text style={styles.insightText}>
                Highest spending day: {dailyData.reduce((a, b) => a.amount > b.amount ? a : b).day}
              </Text>
              <Text style={styles.insightText}>
                Average daily spending: ${formatAmount(
                  dailyData.reduce((sum, day) => sum + day.amount, 0) / dailyData.length
                )}
              </Text>
            </>
          ) : (
            <Text style={styles.noDataText}>No spending data available</Text>
          )}
          {categoryData.length > 0 ? (
            <Text style={styles.insightText}>
              Top spending category: {categoryData[0].name}
            </Text>
          ) : (
            <Text style={styles.noDataText}>No category data available</Text>
          )}
          {monthlyData.length > 0 && (
            <Text style={styles.insightText}>
              Monthly budget adherence: {monthlyData.map(m => 
                m.budget ? `${m.month}: ${((m.amount / m.budget) * 100).toFixed(1)}%` : null
              ).filter(Boolean).join(', ')}
            </Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default StatisticsScreen; 