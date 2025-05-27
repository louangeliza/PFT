import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Text } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.split(' ').map(n => n[0]).join('') || 'U'} 
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.profileInfo}>
            <Title style={{ color: theme.colors.text }}>{user?.name || 'User'}</Title>
            <Paragraph style={{ color: theme.colors.text }}>{user?.email || 'user@example.com'}</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={{ color: theme.colors.text }}>Parking Statistics</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {user?.total_parkings || 0}
              </Text>
              <Text style={{ color: theme.colors.text }}>Total Parkings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                ${user?.total_spent || '0.00'}
              </Text>
              <Text style={{ color: theme.colors.text }}>Total Spent</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={{ color: theme.colors.text }}>Account Settings</Title>
          <Button 
            mode="outlined" 
            onPress={() => {/* Handle edit profile */}}
            style={styles.button}
          >
            Edit Profile
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => {/* Handle change password */}}
            style={styles.button}
          >
            Change Password
          </Button>
          <Button 
            mode="contained" 
            onPress={logout}
            style={[styles.button, { backgroundColor: theme.colors.error }]}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
});

export default ProfileScreen; 