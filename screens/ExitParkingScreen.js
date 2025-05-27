import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';

const ExitParkingScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  const formatDuration = (startTime, endTime) => {
    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
    const wholeHours = Math.floor(durationInHours);
    const minutes = Math.floor((durationInHours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const handlePayment = () => {
    navigation.navigate('Payment', { booking });
  };

  const handlePayLater = () => {
    navigation.navigate('PaymentSuccess', { booking });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Parking Session Complete</Text>

          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Digital Receipt</Text>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Parking Lot</Text>
              <Text style={styles.receiptValue}>{booking.parkingLot.name}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>License Plate</Text>
              <Text style={styles.receiptValue}>{booking.plateNumber}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Entry Time</Text>
              <Text style={styles.receiptValue}>
                {booking.entryTime.toLocaleString()}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Exit Time</Text>
              <Text style={styles.receiptValue}>
                {booking.actualExitTime.toLocaleString()}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Duration</Text>
              <Text style={styles.receiptValue}>
                {formatDuration(booking.entryTime, booking.actualExitTime)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Rate</Text>
              <Text style={styles.receiptValue}>
                ${booking.parkingLot.feePerHour}/hour
              </Text>
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${booking.actualFee}</Text>
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <Text style={styles.paymentTitle}>Payment Options</Text>

            <Button
              mode="contained"
              onPress={handlePayment}
              style={styles.paymentButton}
            >
              Pay Now
            </Button>

            <Button
              mode="outlined"
              onPress={handlePayLater}
              style={[styles.paymentButton, styles.payLaterButton]}
            >
              Pay Later
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  receiptContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
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
  divider: {
    marginVertical: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  paymentContainer: {
    marginTop: 8,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentButton: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  payLaterButton: {
    borderColor: '#2196F3',
  },
});

export default ExitParkingScreen; 