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
const NOTIFICATIONS_KEY = 'notifications';
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

export const getNotifications = async () => {
  try {
    const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const saveNotifications = async (notifications) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

export const addBudgetAlert = async (currentAmount, budgetAmount, budgetType = 'monthly') => {
  try {
    // Get existing notifications
    const notifications = await getNotifications();
    
    // Calculate budget percentage
    const budgetPercentage = (currentAmount / budgetAmount) * 100;
    
    // Define thresholds for different alert levels
    const thresholds = {
      exceeded: 100,
      veryClose: 90,
      approaching: 80
    };

    // Check if we already have a notification for this budget type and threshold
    const existingNotification = notifications.find(n => 
      n.type === 'budget' && 
      n.budgetType === budgetType &&
      n.threshold === getThresholdLevel(budgetPercentage)
    );

    // Only create a new notification if we don't have one for this threshold
    if (!existingNotification) {
      let message = '';
      let threshold = '';

      if (budgetPercentage >= thresholds.exceeded) {
        message = `⚠️ You have exceeded your ${budgetType} budget!`;
        threshold = 'exceeded';
      } else if (budgetPercentage >= thresholds.veryClose) {
        message = `⚠️ You are very close to your ${budgetType} budget!`;
        threshold = 'veryClose';
      } else if (budgetPercentage >= thresholds.approaching) {
        message = `⚠️ You are approaching your ${budgetType} budget`;
        threshold = 'approaching';
      }

      // Only create notification if we have a message
      if (message) {
        const newNotification = {
          id: Date.now().toString(),
          message,
          type: 'budget',
          budgetType,
          threshold,
          createdAt: new Date().toISOString(),
          read: false
        };

        // Add new notification to the beginning of the array
        notifications.unshift(newNotification);
        
        // Save updated notifications
        await saveNotifications(notifications);
        
        // Return the new notification
        return newNotification;
      }
    }

    return null;
  } catch (error) {
    console.error('Error adding budget alert:', error);
    return null;
  }
};

const getThresholdLevel = (percentage) => {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'veryClose';
  if (percentage >= 80) return 'approaching';
  return null;
};

export const addExpenseNotification = async (expense, currentAmount, budgetAmount, budgetType = 'monthly') => {
  try {
    // Get existing notifications
    const notifications = await getNotifications();
    
    // Calculate budget percentage
    const budgetPercentage = (currentAmount / budgetAmount) * 100;
    
    // Create message with expense details and budget status
    const message = `💰 New expense: $${expense.amount.toFixed(2)} for ${expense.name}\n` +
                   `📊 You've used ${budgetPercentage.toFixed(1)}% of your ${budgetType} budget`;

    const newNotification = {
      id: Date.now().toString(),
      message,
      type: 'expense',
      budgetType,
      expenseId: expense.id,
      budgetPercentage,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Add new notification to the beginning of the array
    notifications.unshift(newNotification);
    
    // Save updated notifications
    await saveNotifications(notifications);

    // Also check if we need to add a budget alert
    await addBudgetAlert(currentAmount, budgetAmount, budgetType);
    
    return newNotification;
  } catch (error) {
    console.error('Error adding expense notification:', error);
    return null;
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
    await saveNotifications(updatedNotifications);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notifications = await getNotifications();
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
    await saveNotifications(updatedNotifications);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
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
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}; 