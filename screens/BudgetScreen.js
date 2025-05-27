import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, TextInput, Button, Text, ActivityIndicator, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetScreen = () => {
  const [budgets, setBudgets] = useState({
    monthly: '',
    food: '',
    transportation: '',
    entertainment: '',
    utilities: '',
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const storedBudgets = await AsyncStorage.getItem('budgets');
      const storedNotifications = await AsyncStorage.getItem('notifications');
      
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
      if (storedNotifications !== null) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const saveBudgets = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      Alert.alert('Success', 'Budgets saved successfully');
    } catch (error) {
      console.error('Error saving budgets:', error);
      Alert.alert('Error', 'Failed to save budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (category, value) => {
    // Only allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setBudgets(prev => ({
        ...prev,
        [category]: value
      }));
    }
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
        <Title style={styles.headerTitle}>Budget Settings</Title>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Monthly Budgets</Title>
          
          <View style={styles.inputContainer}>
            <Text>Monthly Total</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={budgets.monthly}
              onChangeText={(value) => handleBudgetChange('monthly', value)}
              style={styles.input}
              placeholder="Enter monthly budget"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text>Food & Dining</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={budgets.food}
              onChangeText={(value) => handleBudgetChange('food', value)}
              style={styles.input}
              placeholder="Enter food budget"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text>Transportation</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={budgets.transportation}
              onChangeText={(value) => handleBudgetChange('transportation', value)}
              style={styles.input}
              placeholder="Enter transportation budget"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text>Entertainment</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={budgets.entertainment}
              onChangeText={(value) => handleBudgetChange('entertainment', value)}
              style={styles.input}
              placeholder="Enter entertainment budget"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text>Utilities</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={budgets.utilities}
              onChangeText={(value) => handleBudgetChange('utilities', value)}
              style={styles.input}
              placeholder="Enter utilities budget"
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.notificationContainer}>
            <View>
              <Title>Budget Notifications</Title>
              <Text>Get notified when you're close to your budget limits</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveBudgets}
        style={styles.saveButton}
        loading={loading}
      >
        Save Budgets
      </Button>
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
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    marginTop: 4,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    margin: 16,
    marginTop: 0,
  },
});

export default BudgetScreen; 