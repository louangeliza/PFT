import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import { getUnreadNotificationCount } from '../services/notifications';
import { useFocusEffect } from '@react-navigation/native';

const NotificationBell = ({ onPress }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  // Refresh count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  useEffect(() => {
    // Initial load
    loadUnreadCount();
    // Refresh unread count every minute
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <IconButton
        icon="bell"
        size={24}
        onPress={() => {
          onPress();
          loadUnreadCount(); // Refresh count after viewing notifications
        }}
      />
      {unreadCount > 0 && (
        <Badge
          size={16}
          style={styles.badge}
        >
          {unreadCount}
        </Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
  },
});

export default NotificationBell; 