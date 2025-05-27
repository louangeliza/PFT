import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import StarRating from '../components/StarRating';

const ParkingLotDetailsScreen = ({ route, navigation }) => {
  const { parkingLot } = route.params;

  const handleBookNow = () => {
    navigation.navigate('BookingForm', {
      parkingLot: parkingLot
    });
  };

  // Mock coordinates - in real app, these would come from the API
  const mockLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{parkingLot.name}</Text>
          <Text style={styles.location}>{parkingLot.location}</Text>
          
          <View style={styles.ratingContainer}>
            <StarRating rating={parkingLot.rating || 0} size={24} />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vacant Spaces</Text>
              <Text style={styles.detailValue}>{parkingLot.vacantSpaces}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee per Hour</Text>
              <Text style={styles.detailValue}>${parkingLot.feePerHour}</Text>
            </View>

            {parkingLot.amenities && (
              <View style={styles.amenitiesContainer}>
                <Text style={styles.amenitiesTitle}>Amenities</Text>
                {parkingLot.amenities.map((amenity, index) => (
                  <Text key={index} style={styles.amenity}>
                    • {amenity}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                ...mockLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={mockLocation}
                title={parkingLot.name}
                description={parkingLot.location}
              />
            </MapView>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Parking Rules</Text>
          <View style={styles.rulesContainer}>
            <Text style={styles.ruleText}>• 24/7 parking available</Text>
            <Text style={styles.ruleText}>• Maximum stay: 24 hours</Text>
            <Text style={styles.ruleText}>• No overnight parking on weekends</Text>
            <Text style={styles.ruleText}>• First 15 minutes free</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleBookNow}
          style={styles.bookButton}
        >
          Book Parking
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  amenitiesContainer: {
    marginTop: 16,
  },
  amenitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amenity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  rulesContainer: {
    marginTop: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingTop: 8,
  },
  bookButton: {
    paddingVertical: 8,
  },
});

export default ParkingLotDetailsScreen; 