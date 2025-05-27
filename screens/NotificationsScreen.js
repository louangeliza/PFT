import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Switch, Text, Divider } from 'react-native-paper';
import { getNotificationSettings, updateNotificationSettings } from '../services/notifications';

const NotificationsScreen = () => {
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    expenseReminders: true,
    weeklyReports: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

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
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>
      <FlatList
        data={settingsList}
        renderItem={({ item }) => renderSettingItem(item)}
        keyExtractor={item => item.key}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});

export default NotificationsScreen; 