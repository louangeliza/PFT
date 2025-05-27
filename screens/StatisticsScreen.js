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

  const processChartData = (expenseData) => {
    // Process monthly data
    const monthlyExpenses = {};
    const dailyExpenses = {};
    const categoryExpenses = {};

    expenseData.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const dayKey = date.toLocaleDateString();
      const category = expense.category || 'Uncategorized';

      // Monthly data
      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + Number(expense.amount);
      
      // Daily data
      dailyExpenses[dayKey] = (dailyExpenses[dayKey] || 0) + Number(expense.amount);
      
      // Category data
      categoryExpenses[category] = (categoryExpenses[category] || 0) + Number(expense.amount);
    });

    // Convert to arrays for charts
    const monthlyChartData = Object.entries(monthlyExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: month.split('-')[1], // Just the month number
        amount: amount
      }));

    const dailyChartData = Object.entries(dailyExpenses)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7) // Last 7 days
      .map(([day, amount]) => ({
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        amount: amount
      }));

    const categoryChartData = Object.entries(categoryExpenses)
      .map(([category, amount]) => ({
        name: category,
        amount: amount,
        color: getRandomColor(),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }));

    setMonthlyData(monthlyChartData);
    setDailyData(dailyChartData);
    setCategoryData(categoryChartData);
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
          <BarChart
            data={{
              labels: dailyData.map(d => d.day),
              datasets: [{
                data: dailyData.map(d => d.amount)
              }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
          <LineChart
            data={{
              labels: monthlyData.map(m => m.month),
              datasets: [{
                data: monthlyData.map(m => m.amount)
              }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Spending by Category</Text>
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
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.chartTitle}>Spending Insights</Text>
          {dailyData.length > 0 && (
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
          )}
          {categoryData.length > 0 && (
            <Text style={styles.insightText}>
              Top spending category: {categoryData.reduce((a, b) => a.amount > b.amount ? a : b).name}
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
});

export default StatisticsScreen; 