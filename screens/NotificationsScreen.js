import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { getNotifications, markNotificationAsRead } from '../services/notifications';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notification) => {
    try {
      // Mark as read
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id 
            ? { ...n, read: true }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const renderNotification = ({ item }) => (
    <Card style={[
      styles.notificationCard,
      item.read && styles.readNotificationCard
    ]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationMessage,
            item.read && styles.readNotificationMessage
          ]}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {!item.read && (
          <IconButton
            icon="check"
            size={20}
            onPress={() => handleMarkAsRead(item)}
            style={styles.markReadButton}
          />
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noNotifications}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadNotifications}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  readNotificationCard: {
    backgroundColor: '#f8f8f8',
    elevation: 0,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  readNotificationMessage: {
    color: '#666',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  markReadButton: {
    margin: 0,
  },
  noNotifications: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen; 