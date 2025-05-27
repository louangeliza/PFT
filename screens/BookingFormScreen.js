import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText, Card, Title, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingFormScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const auth = useAuth();
  const { parkingLot } = route.params;
  const [plateNumber, setPlateNumber] = useState('');
  
  // Set initial times to current time and 1 hour later
  const now = new Date();
  const [entryTime, setEntryTime] = useState(now);
  const [exitTime, setExitTime] = useState(new Date(now.getTime() + 3600000));
  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!plateNumber.trim()) {
      newErrors.plateNumber = 'License plate number is required';
    }
    
    if (entryTime >= exitTime) {
      newErrors.time = 'Exit time must be after entry time';
    }

    // Check if times are on the same day
    if (entryTime.getDate() !== exitTime.getDate() ||
        entryTime.getMonth() !== exitTime.getMonth() ||
        entryTime.getFullYear() !== exitTime.getFullYear()) {
      newErrors.time = 'Booking must be on the same day';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!plateNumber || !entryTime || !exitTime) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate fee based on duration
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const durationHours = (exit - entry) / (1000 * 60 * 60);
      const hourlyRate = parseFloat(parkingLot.feePerHour); // Use the parking lot's fee per hour
      const fee = parseFloat((durationHours * hourlyRate).toFixed(2));

      console.log('Booking details:', {
        duration: durationHours,
        hourlyRate,
        calculatedFee: fee,
        parkingLotFee: parkingLot.feePerHour
      });

      // Create booking in the API
      const bookingData = {
        userId: auth.user.id,
        parkingLotId: parkingLot.id,
        parkingLotName: parkingLot.name,
        licensePlate: plateNumber,
        startTime: entry.toISOString(),
        endTime: exit.toISOString(),
        fee: fee,
        status: 'active',
        spaceNumber: `A-${Math.floor(Math.random() * 100) + 1}` // Random space number for demo
      };

      console.log('Submitting booking data:', bookingData);
      const booking = await api.createBooking(bookingData);

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Navigate to active parking screen
      navigation.navigate('MainApp', { 
        screen: 'ActiveParking',
        params: { booking }
      });
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTimeChange = (event, selectedTime, type) => {
    if (Platform.OS === 'android') {
      setShowEntryPicker(false);
      setShowExitPicker(false);
    }
    
    if (selectedTime) {
      const newTime = new Date(now);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      
      if (type === 'entry') {
        setEntryTime(newTime);
      } else {
        setExitTime(newTime);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Title style={[styles.title, { color: theme.colors.text }]}>Book Parking Space</Title>
          
          <Text style={[styles.parkingLotName, { color: theme.colors.text }]}>{parkingLot.name}</Text>
          <Text style={[styles.parkingLotLocation, { color: theme.colors.placeholder }]}>{parkingLot.location}</Text>
          <Text style={[styles.feeText, { color: theme.colors.primary }]}>Fee per hour: ${parkingLot.feePerHour}</Text>
          <Text style={[styles.dateText, { color: theme.colors.placeholder }]}>Date: {now.toLocaleDateString()}</Text>

          <TextInput
            label="License Plate Number"
            value={plateNumber}
            onChangeText={setPlateNumber}
            style={styles.input}
            error={!!errors.plateNumber}
            theme={theme}
          />
          <HelperText type="error" visible={!!errors.plateNumber}>
            {errors.plateNumber}
          </HelperText>

          <View style={styles.dateContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Entry Time</Text>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface
              }]}
              onPress={() => setShowEntryPicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>{formatTime(entryTime)}</Text>
            </TouchableOpacity>
            {showEntryPicker && (
              <DateTimePicker
                value={entryTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, time) => handleTimeChange(event, time, 'entry')}
                minimumDate={now}
                textColor={theme.colors.text}
              />
            )}
          </View>

          <View style={styles.dateContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Exit Time</Text>
            <TouchableOpacity 
              style={[styles.dateButton, { 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface
              }]}
              onPress={() => setShowExitPicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>{formatTime(exitTime)}</Text>
            </TouchableOpacity>
            {showExitPicker && (
              <DateTimePicker
                value={exitTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, time) => handleTimeChange(event, time, 'exit')}
                minimumDate={entryTime}
                textColor={theme.colors.text}
              />
            )}
          </View>

          {errors.time && (
            <HelperText type="error" visible={true}>
              {errors.time}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleBooking}
            style={styles.button}
            theme={theme}
            loading={loading}
          >
            Confirm Booking
          </Button>

          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}
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
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  parkingLotName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  parkingLotLocation: {
    fontSize: 16,
    marginBottom: 8,
  },
  feeText: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dateContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default BookingFormScreen; 