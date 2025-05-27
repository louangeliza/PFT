import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator } from 'react-native-paper';
import { getStoredNotifications } from '../services/notifications';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getStoredNotifications();
      // Filter only budget alerts
      const budgetAlerts = data.filter(notification => notification.type === 'budget_alert');
      setNotifications(budgetAlerts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Title style={styles.headerTitle}>Budget Alerts</Title>
        <Paragraph style={styles.headerSubtitle}>
          Stay informed about your spending habits
        </Paragraph>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noNotifications}>No budget alerts</Text>
          <Text style={styles.noNotificationsSubtitle}>
            You'll receive alerts when you're close to your monthly budget
          </Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} style={styles.card}>
            <Card.Content>
              <View style={styles.alertHeader}>
                <Title style={styles.alertTitle}>{notification.title}</Title>
                <Text style={styles.alertTime}>{formatDate(notification.timestamp)}</Text>
              </View>
              <Paragraph style={styles.alertMessage}>{notification.message}</Paragraph>
              <View style={styles.budgetDetails}>
                <Text style={styles.budgetText}>
                  Current Spending: ${notification.data.monthlyTotal.toFixed(2)}
                </Text>
                <Text style={styles.budgetText}>
                  Monthly Budget: ${notification.data.monthlyBudget.toFixed(2)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(notification.data.percentage, 100)}%`,
                        backgroundColor: notification.data.percentage > 90 ? '#ff4444' : '#ffbb33'
                      }
                    ]} 
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
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
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    color: '#ff4444',
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 16,
  },
  budgetDetails: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  budgetText: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noNotifications: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noNotificationsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen; 