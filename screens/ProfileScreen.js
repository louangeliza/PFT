import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Switch, Text, Divider, Button, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationSettings, updateNotificationSettings } from '../services/notifications';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    expenseReminders: true,
    weeklyReports: true,
  });

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    const savedSettings = await getNotificationSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const handleToggle = async (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    await updateNotificationSettings(newSettings);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = ({ title, description, key }) => (
    <List.Item
      title={title}
      description={description}
      right={() => (
        <Switch
          value={settings[key]}
          onValueChange={() => handleToggle(key)}
        />
      )}
    />
  );

  const settingsList = [
    {
      title: 'Budget Alerts',
      description: 'Get notified when you reach your budget limit',
      key: 'budgetAlerts',
    },
    {
      title: 'Expense Reminders',
      description: 'Receive reminders for recurring expenses',
      key: 'expenseReminders',
    },
    {
      title: 'Weekly Reports',
      description: 'Get weekly summaries of your spending',
      key: 'weeklyReports',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        {settingsList.map((item, index) => (
          <React.Fragment key={item.key}>
            {renderSettingItem(item)}
            {index < settingsList.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    fontSize: 16,
  },
});

export default ProfileScreen; 