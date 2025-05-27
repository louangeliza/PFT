import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { getNotificationSettings } from '../services/notifications';

const NotificationBell = ({ onPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
    setupNotificationListener();
  }, []);

  const loadSettings = async () => {
    const notificationSettings = await getNotificationSettings();
    setSettings(notificationSettings);
  };

  const setupNotificationListener = () => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.remove();
    };
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <IconButton
        icon="bell"
        size={24}
        iconColor="#fff"
        style={styles.icon}
      />
      {unreadCount > 0 && (
        <Badge
          size={16}
          style={styles.badge}
        >
          {unreadCount}
        </Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 8,
  },
  icon: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
  },
});

export default NotificationBell; 