import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Booking Confirmed!</Text>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={booking.id}
              size={200}
              backgroundColor="white"
            />
          </View>

          <View style={styles.ticketContainer}>
            <Text style={styles.ticketLabel}>Ticket ID</Text>
            <Text style={styles.ticketValue}>{booking.id}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.ticketLabel}>Parking Lot</Text>
            <Text style={styles.ticketValue}>{booking.parkingLot.name}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.ticketLabel}>License Plate</Text>
            <Text style={styles.ticketValue}>{booking.plateNumber}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.ticketLabel}>Entry Time</Text>
            <Text style={styles.ticketValue}>
              {booking.entryTime.toLocaleString()}
            </Text>

            <Divider style={styles.divider} />

            <Text style={styles.ticketLabel}>Expected Exit Time</Text>
            <Text style={styles.ticketValue}>
              {booking.exitTime.toLocaleString()}
            </Text>

            <Divider style={styles.divider} />

            <Text style={styles.ticketLabel}>Estimated Fee</Text>
            <Text style={styles.ticketValue}>${booking.estimatedFee}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ActiveParking', { booking })}
              style={styles.button}
            >
              Track Parking
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Dashboard')}
              style={[styles.button, styles.secondaryButton]}
            >
              Back to Home
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
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  ticketContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  ticketLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  secondaryButton: {
    borderColor: '#2196F3',
  },
});

export default BookingConfirmationScreen; 