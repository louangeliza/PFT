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

export const addBudgetAlert = async (monthlyTotal, monthlyBudget) => {
  try {
    const threshold = monthlyBudget * 0.8; // Alert at 80% of budget
    const percentage = Math.round((monthlyTotal / monthlyBudget) * 100);
    
    if (monthlyTotal >= threshold) {
      const notifications = await getStoredNotifications();
      const newNotification = {
        id: Date.now().toString(),
        type: 'budget_alert',
        title: 'Budget Alert',
        message: `You've reached ${percentage}% of your monthly budget!`,
        timestamp: new Date().toISOString(),
        read: false,
        data: {
          monthlyTotal,
          monthlyBudget,
          percentage
        }
      };
      
      notifications.unshift(newNotification);
      await storeNotifications(notifications);
      return newNotification;
    }
    return null;
  } catch (error) {
    console.error('Error adding budget alert:', error);
    return null;
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

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = await getStoredNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    await storeNotifications(updatedNotifications);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const notifications = await getStoredNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}; 