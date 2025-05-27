import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Portal, Dialog, TextInput, RadioButton } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActiveParkingScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const auth = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [hasActiveParking, setHasActiveParking] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [extendError, setExtendError] = useState('');
  const [activeParking, setActiveParking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a new booking from navigation params
    if (route.params?.booking) {
      const booking = route.params.booking;
      console.log('Received booking data:', booking);
      setActiveParking({
        parkingLot: booking.parking_lot_name,
        startTime: new Date(booking.start_time).toLocaleString(),
        duration: `${Math.ceil((new Date(booking.end_time) - new Date(booking.start_time)) / (1000 * 60 * 60))} hours`,
        fee: `$${parseFloat(booking.fee).toFixed(2)}`,
        spaceNumber: booking.space_number,
        bookingId: booking.id
      });
      setHasActiveParking(true);
      setLoading(false);
    } else {
      fetchActiveParking();
    }
  }, [route.params?.booking]);

  const fetchActiveParking = async () => {
    try {
      setLoading(true);
      // Fetch active parking session for the current user
      const bookings = await api.getUserBookings(auth.user.id);
      console.log('Fetched bookings:', bookings);
      
      // If no bookings exist yet, set hasActiveParking to false
      if (!bookings || bookings.length === 0) {
        setHasActiveParking(false);
        setActiveParking(null);
        return;
      }

      const activeBooking = bookings.find(booking => 
        booking.status === 'active' && 
        new Date(booking.end_time) > new Date()
      );

      if (activeBooking) {
        console.log('Found active booking:', activeBooking);
        setActiveParking({
          parkingLot: activeBooking.parking_lot_name,
          startTime: new Date(activeBooking.start_time).toLocaleString(),
          duration: `${Math.ceil((new Date(activeBooking.end_time) - new Date(activeBooking.start_time)) / (1000 * 60 * 60))} hours`,
          fee: `$${parseFloat(activeBooking.fee).toFixed(2)}`,
          spaceNumber: activeBooking.space_number,
          bookingId: activeBooking.id
        });
        setHasActiveParking(true);
      } else {
        setHasActiveParking(false);
        setActiveParking(null);
      }
    } catch (error) {
      console.error('Error fetching active parking:', error);
      setHasActiveParking(false);
      setActiveParking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEndParking = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmEndParking = () => {
    setShowConfirmDialog(false);
    setShowPaymentDialog(true);
  };

  const handleExtendParking = () => {
    setShowExtendDialog(true);
  };

  const calculateNewFee = (currentFee, additionalHours) => {
    const currentAmount = parseFloat(currentFee.replace('$', ''));
    const hourlyRate = currentAmount / parseInt(activeParking.duration);
    const newAmount = currentAmount + (hourlyRate * additionalHours);
    return `$${newAmount.toFixed(2)}`;
  };

  const handleExtendConfirm = async () => {
    try {
      const additionalHours = parseInt(selectedDuration);
      const newFee = calculateNewFee(activeParking.fee, additionalHours);
      const newDuration = `${parseInt(activeParking.duration) + additionalHours} hours`;

      // Get the current end time from the active booking
      const bookings = await api.getUserBookings(auth.user.id);
      const currentBooking = bookings.find(b => b.id === activeParking.bookingId);
      
      if (!currentBooking) {
        throw new Error('Could not find current booking');
      }

      // Calculate new end time by adding additional hours to current end time
      const currentEndTime = new Date(currentBooking.end_time);
      const newEndTime = new Date(currentEndTime);
      newEndTime.setHours(newEndTime.getHours() + additionalHours);

      console.log('Current end time:', currentEndTime);
      console.log('New end time:', newEndTime);

      // Update the booking in the API
      const updatedBooking = await api.updateBooking(activeParking.bookingId, {
        userId: auth.user.id,
        end_time: newEndTime.toISOString(),
        fee: parseFloat(newFee.replace('$', '')),
        status: 'active'
      });

      if (updatedBooking) {
        // Update the active parking session
        const updatedParking = {
          ...activeParking,
          duration: newDuration,
          fee: newFee
        };

        setActiveParking(updatedParking);
        setShowExtendDialog(false);
        setExtendError('');

        // Show success message
        alert(`Parking extended successfully! New duration: ${newDuration}`);
      }
    } catch (error) {
      console.error('Extend parking error:', error);
      setExtendError('Failed to extend parking. Please try again.');
    }
  };

  const handlePayment = async () => {
    // Validate payment details
    if (!cardNumber || !expiryDate || !cvv) {
      setPaymentError('Please fill in all payment details');
      return;
    }

    try {
      // Get the current user data
      const currentUser = auth.user;
      
      // Update the booking status in the API
      await api.updateBooking(activeParking.bookingId, {
        userId: currentUser.id,
        status: 'completed',
        end_time: new Date().toISOString()
      });
      
      // Calculate new statistics
      const currentTotalParkings = parseInt(currentUser.total_parkings || 0);
      const currentTotalSpent = parseFloat(currentUser.total_spent || 0);
      const currentFee = parseFloat(activeParking.fee.replace('$', ''));
      
      console.log('Updating user statistics:', {
        currentTotalParkings,
        currentTotalSpent,
        currentFee,
        newTotalParkings: currentTotalParkings + 1,
        newTotalSpent: (currentTotalSpent + currentFee).toFixed(2)
      });
      
      // Update user's total parkings and total spent
      const updatedUserData = {
        ...currentUser,
        total_parkings: currentTotalParkings + 1,
        total_spent: (currentTotalSpent + currentFee).toFixed(2)
      };
      
      // Update user in the API
      const updatedUser = await api.updateUser(currentUser.id, updatedUserData);
      
      if (!updatedUser) {
        throw new Error('Failed to update user data');
      }
      
      // Update user in context and save session
      auth.setUser(updatedUser);
      await AsyncStorage.setItem('@auth_session', JSON.stringify({
        userData: updatedUser,
        timestamp: new Date().getTime()
      }));
      
      // Close dialogs and reset form
      setShowPaymentDialog(false);
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setPaymentError('');
      setHasActiveParking(false);
      setActiveParking(null);
      
      // Show success message
      alert('Payment successful! Thank you for using our parking service.');
      
      // Navigate back to home
      navigation.navigate('MainApp', { screen: 'Home' });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Title>Loading...</Title>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!hasActiveParking) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Title style={styles.emptyTitle}>No Active Parking</Title>
            <Paragraph style={styles.emptyText}>
              You don't have any active parking sessions at the moment.
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
              style={styles.findParkingButton}
            >
              Find Parking
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Active Parking Session</Title>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Parking Lot:</Text>
              <Text style={styles.value}>{activeParking.parkingLot}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Start Time:</Text>
              <Text style={styles.value}>{activeParking.startTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{activeParking.duration}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fee:</Text>
              <Text style={styles.value}>{activeParking.fee}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Space Number:</Text>
              <Text style={styles.value}>{activeParking.spaceNumber}</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="contained" 
            onPress={handleExtendParking}
            style={styles.button}
          >
            Extend Parking
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleEndParking}
            style={styles.button}
          >
            End Parking
          </Button>
        </Card.Actions>
      </Card>

      {/* Extend Parking Dialog */}
      <Portal>
        <Dialog visible={showExtendDialog} onDismiss={() => setShowExtendDialog(false)}>
          <Dialog.Title>Extend Parking Duration</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.currentDuration}>
              Current Duration: {activeParking.duration}
            </Text>
            <Text style={styles.selectDuration}>Select additional hours:</Text>
            <RadioButton.Group onValueChange={value => setSelectedDuration(value)} value={selectedDuration}>
              <RadioButton.Item label="1 hour" value="1" />
              <RadioButton.Item label="2 hours" value="2" />
              <RadioButton.Item label="3 hours" value="3" />
              <RadioButton.Item label="4 hours" value="4" />
            </RadioButton.Group>
            <Text style={styles.newFee}>
              New Total Fee: {calculateNewFee(activeParking.fee, parseInt(selectedDuration))}
            </Text>
            {extendError ? (
              <Text style={styles.errorText}>{extendError}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExtendDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleExtendConfirm}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm End Parking</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to end your parking session?</Paragraph>
            <Paragraph style={styles.feeText}>Total Fee: {activeParking.fee}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onPress={handleConfirmEndParking}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Payment Dialog */}
      <Portal>
        <Dialog visible={showPaymentDialog} onDismiss={() => setShowPaymentDialog(false)}>
          <Dialog.Title>Payment Details</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.totalFee}>Total Amount: {activeParking.fee}</Text>
            
            <TextInput
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
              style={styles.input}
            />
            
            <View style={styles.row}>
              <TextInput
                label="Expiry Date (MM/YY)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                maxLength={5}
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
              />
              <TextInput
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
                style={[styles.input, styles.halfInput]}
                secureTextEntry
              />
            </View>

            {paymentError ? (
              <Text style={styles.errorText}>{paymentError}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handlePayment}>Pay Now</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  emptyCard: {
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  findParkingButton: {
    marginTop: 10,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  infoContainer: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginHorizontal: 8,
  },
  feeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#2196F3',
  },
  totalFee: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2196F3',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  currentDuration: {
    fontSize: 16,
    marginBottom: 16,
  },
  selectDuration: {
    fontSize: 16,
    marginBottom: 8,
  },
  newFee: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#2196F3',
  },
});

export default ActiveParkingScreen; 