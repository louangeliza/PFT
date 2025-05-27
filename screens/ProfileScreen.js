import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const budget = await AsyncStorage.getItem('monthlyBudget');
      if (budget) {
        setMonthlyBudget(budget);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpdateBudget = async () => {
    try {
      await AsyncStorage.setItem('monthlyBudget', monthlyBudget);
      Alert.alert('Success', 'Monthly budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert('Error', 'Failed to update monthly budget');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user.username.charAt(0).toUpperCase()} 
          style={styles.avatar}
        />
        <Text style={styles.username}>{user.username}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TextInput
            label="Monthly Budget"
            value={monthlyBudget}
            onChangeText={setMonthlyBudget}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button 
            mode="contained" 
            onPress={handleUpdateBudget}
            style={styles.button}
          >
            Update Budget
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Member Since:</Text>
            <Text style={styles.value}>
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#ff4444"
      >
        Log Out
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
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    margin: 16,
    borderColor: '#ff4444',
  },
});

export default ProfileScreen; 