import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getExpenses } from '../services/api';

const StatisticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
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
    const monthlyExpenses = {};
    data.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + Number(expense.amount);
    });

    const monthlyChartData = {
      labels: Object.keys(monthlyExpenses),
      datasets: [{
        data: Object.values(monthlyExpenses)
      }]
    };
    setMonthlyData(monthlyChartData);

    // Process category data
    const categoryExpenses = {};
    data.forEach(expense => {
      const category = expense.description || 'Uncategorized';
      categoryExpenses[category] = (categoryExpenses[category] || 0) + Number(expense.amount);
    });

    const pieChartData = Object.entries(categoryExpenses).map(([name, value], index) => ({
      name,
      value,
      color: `hsl(${index * 45}, 70%, 50%)`,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
    setCategoryData(pieChartData);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expense Statistics</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Expenses</Title>
          {monthlyData.datasets[0].data.length > 0 ? (
            <LineChart
              data={monthlyData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Paragraph>No data available</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Expense Categories</Title>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          ) : (
            <Paragraph>No data available</Paragraph>
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
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StatisticsScreen; 