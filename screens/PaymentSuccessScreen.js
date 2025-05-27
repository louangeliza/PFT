import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.iconContainer}>
            <IconButton
              icon="check-circle"
              size={80}
              iconColor="#4CAF50"
              style={styles.successIcon}
            />
          </View>

          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Thank you for using CARGOJET</Text>

          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Receipt</Text>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={styles.receiptValue}>
                {Math.random().toString(36).substring(7).toUpperCase()}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount Paid</Text>
              <Text style={styles.receiptValue}>${booking.actualFee}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date</Text>
              <Text style={styles.receiptValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Time</Text>
              <Text style={styles.receiptValue}>
                {new Date().toLocaleTimeString()}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.button}
            >
              Back to Home
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('History')}
              style={[styles.button, styles.historyButton]}
            >
              View History
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    margin: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  receiptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  historyButton: {
    borderColor: '#2196F3',
  },
});

export default PaymentSuccessScreen;
