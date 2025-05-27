import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const NOTIFICATIONS_KEY = '@notifications';
const BUDGET_THRESHOLDS = [80, 90, 95, 100]; // Percentages at which to send notifications

export const setupNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  return true;
};

export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      budgetAlerts: true,
      expenseReminders: true,
      weeklyReports: true,
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      budgetAlerts: true,
      expenseReminders: true,
      weeklyReports: true,
    };
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error updating notification settings:', error);
  }
};

export const addBudgetAlert = async (monthlyTotal, monthlyBudget) => {
  try {
    const percentage = (monthlyTotal / monthlyBudget) * 100;
    
    // Get existing notifications
    const existingNotifications = await getNotifications();
    
    // Check if we already have a notification for this threshold
    const threshold = BUDGET_THRESHOLDS.find(t => percentage >= t && percentage < t + 5);
    if (!threshold) return null; // No new threshold reached
    
    const existingThresholdNotification = existingNotifications.find(
      n => n.type === 'budget_alert' && 
           n.data.threshold === threshold &&
           new Date(n.timestamp).getDate() === new Date().getDate() // Only check today's notifications
    );
    
    if (existingThresholdNotification) return null; // Already notified for this threshold today

    const notification = {
      id: Date.now().toString(),
      type: 'budget_alert',
      title: 'Budget Alert',
      message: `You've spent ${percentage.toFixed(1)}% of your monthly budget`,
      timestamp: new Date().toISOString(),
      data: {
        monthlyTotal,
        monthlyBudget,
        percentage,
        threshold
      },
      read: false
    };

    const updatedNotifications = [notification, ...existingNotifications];
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    return notification;
  } catch (error) {
    console.error('Error adding budget alert:', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const notifications = await getNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export const getStoredNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting stored notifications:', error);
    return [];
  }
};

export const storeNotifications = async (notifications) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error storing notifications:', error);
  }
};

export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}; 