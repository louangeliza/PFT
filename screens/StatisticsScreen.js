import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getExpenses } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const StatisticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    daily: { labels: [], datasets: [{ data: [] }] },
    monthly: { labels: [], datasets: [{ data: [] }] },
    categories: { labels: [], data: [] }
  });
  const [insights, setInsights] = useState({
    highestSpendingDay: { date: '', amount: 0 },
    averageDailySpending: 0,
    topCategory: { name: '', amount: 0 }
  });
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
      processExpenseData(data);
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

  const processExpenseData = (expenseData) => {
    // Process daily spending data
    const dailyData = processDailyData(expenseData);
    // Process monthly spending data
    const monthlyData = processMonthlyData(expenseData);
    // Process category data
    const categoryData = processCategoryData(expenseData);
    // Calculate insights
    const newInsights = calculateInsights(expenseData, dailyData);

    setChartData({
      daily: dailyData,
      monthly: monthlyData,
      categories: categoryData
    });
    setInsights(newInsights);
  };

  const processDailyData = (expenseData) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailySpending = last7Days.map(date => {
      const dayExpenses = expenseData.filter(expense => 
        expense.createdAt.split('T')[0] === date
      );
      return dayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{ data: dailySpending }]
    };
  };

  const processMonthlyData = (expenseData) => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();

    const monthlySpending = last6Months.map(month => {
      const monthExpenses = expenseData.filter(expense => 
        expense.createdAt.startsWith(month)
      );
      return monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    });

    return {
      labels: last6Months.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
      }),
      datasets: [{ data: monthlySpending }]
    };
  };

  const processCategoryData = (expenseData) => {
    const categoryTotals = expenseData.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedCategories.map(([category]) => category),
      data: sortedCategories.map(([, amount]) => amount)
    };
  };

  const calculateInsights = (expenseData, dailyData) => {
    // Find highest spending day
    const highestDayIndex = dailyData.datasets[0].data.indexOf(Math.max(...dailyData.datasets[0].data));
    const highestSpendingDay = {
      date: dailyData.labels[highestDayIndex],
      amount: dailyData.datasets[0].data[highestDayIndex]
    };

    // Calculate average daily spending
    const totalSpending = dailyData.datasets[0].data.reduce((sum, amount) => sum + amount, 0);
    const averageDailySpending = totalSpending / dailyData.datasets[0].data.length;

    // Find top spending category
    const categoryTotals = expenseData.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      highestSpendingDay,
      averageDailySpending,
      topCategory: {
        name: topCategory[0],
        amount: topCategory[1]
      }
    };
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

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
    color: (opacity = 1) => `rgba(81, 45, 168, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Daily Spending</Text>
          <BarChart
            data={chartData.daily}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            showValuesOnTopOfBars
            fromZero
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Monthly Spending Trend</Text>
          <LineChart
            data={chartData.monthly}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Spending by Category</Text>
          <PieChart
            data={chartData.categories.data.map((value, index) => ({
              value,
              name: chartData.categories.labels[index],
              color: `rgba(81, 45, 168, ${0.8 - (index * 0.1)})`,
              legendFontColor: '#7F7F7F',
              legendFontSize: 12
            }))}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Highest Spending Day:</Text>
            <Text style={styles.insightValue}>
              {insights.highestSpendingDay.date} (${insights.highestSpendingDay.amount.toFixed(2)})
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Average Daily Spending:</Text>
            <Text style={styles.insightValue}>
              ${insights.averageDailySpending.toFixed(2)}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Top Spending Category:</Text>
            <Text style={styles.insightValue}>
              {insights.topCategory.name} (${insights.topCategory.amount.toFixed(2)})
            </Text>
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
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  insightLabel: {
    fontSize: 16,
    color: '#666',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StatisticsScreen; 