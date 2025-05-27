import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Title, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { getExpenses } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const StatisticsScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState({ labels: [], datasets: [{ data: [] }] });

  const screenWidth = Dimensions.get('window').width;

  const loadExpenses = async () => {
    try {
      setLoading(true);
      console.log('Loading expenses for statistics...');
      const data = await getExpenses();
      console.log('Expenses loaded for statistics:', data);
      setExpenses(data);
      processData(data);
    } catch (error) {
      console.error('Error loading expenses for statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [])
  );

  const processData = (data) => {
    if (!data || data.length === 0) {
      console.log('No data to process for statistics');
      return;
    }

    // Process monthly data
    const monthlyTotals = {};
    data.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(expense.amount);
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyTotals).sort();
    const monthlyChartData = {
      labels: sortedMonths.map(key => {
        const [year, month] = key.split('-');
        return `${month}/${year.slice(2)}`;
      }),
      datasets: [{
        data: sortedMonths.map(key => monthlyTotals[key])
      }]
    };
    console.log('Processed monthly data:', monthlyChartData);
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
    console.log('Processed category data:', categoryChartData);
    setCategoryData(categoryChartData);

    // Process weekly data (last 7 days)
    const dailyTotals = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize the last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyTotals[dateKey] = 0;
    }

    // Fill in actual expense data
    data.forEach(expense => {
      const date = new Date(expense.createdAt);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      
      // Only include expenses from the last 7 days
      if (date >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(expense.amount);
      }
    });

    // Sort days chronologically
    const sortedDays = Object.keys(dailyTotals).sort();
    const weeklyChartData = {
      labels: sortedDays.map(key => {
        const date = new Date(key);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        data: sortedDays.map(key => dailyTotals[key])
      }]
    };
    console.log('Processed weekly data:', weeklyChartData);
    setWeeklyData(weeklyChartData);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Last 7 Days Spending</Title>
          {weeklyData.labels && weeklyData.labels.length > 0 ? (
            <LineChart
              data={weeklyData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
              yAxisLabel="$"
              yAxisSuffix=""
            />
          ) : (
            <Text style={styles.noData}>No data available for the last 7 days</Text>
          )}
        </Card.Content>
      </Card>

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