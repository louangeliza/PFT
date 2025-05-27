import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getExpenses } from '../services/api';

const StatisticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
      processData(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    // Process monthly data
    const monthlyTotals = {};
    data.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(expense.amount);
    });

    const monthlyChartData = {
      labels: Object.keys(monthlyTotals).map(key => {
        const [year, month] = key.split('-');
        return `${month}/${year.slice(2)}`;
      }),
      datasets: [{
        data: Object.values(monthlyTotals)
      }]
    };
    setMonthlyData(monthlyChartData);

    // Process category data
    const categoryTotals = {};
    data.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });

    const categoryChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      amount: amount,
      color: getRandomColor(),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
    setCategoryData(categoryChartData);

    // Process daily data (last 30 days)
    const dailyTotals = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.forEach(expense => {
      const date = new Date(expense.createdAt);
      if (date >= thirtyDaysAgo) {
        const dayKey = date.toISOString().split('T')[0];
        dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + Number(expense.amount);
      }
    });

    const dailyChartData = {
      labels: Object.keys(dailyTotals).map(key => {
        const date = new Date(key);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        data: Object.values(dailyTotals)
      }]
    };
    setDailyData(dailyChartData);
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Monthly Spending</Title>
          {monthlyData.labels && monthlyData.labels.length > 0 ? (
            <BarChart
              data={monthlyData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.noData}>No monthly data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Spending by Category</Title>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noData}>No category data available</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Daily Spending (Last 30 Days)</Title>
          {dailyData.labels && dailyData.labels.length > 0 ? (
            <BarChart
              data={dailyData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel="$"
              yAxisSuffix=""
              withInnerLines={false}
            />
          ) : (
            <Text style={styles.noData}>No daily data available</Text>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});

export default StatisticsScreen; 