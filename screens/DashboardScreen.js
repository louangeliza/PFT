import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, Card, Text, Button, ActivityIndicator, Menu, Divider } from 'react-native-paper';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

// Filter options
const FILTER_OPTIONS = {
  PRICE_LOW_TO_HIGH: 'Price: Low to High',
  PRICE_HIGH_TO_LOW: 'Price: High to Low',
  RATING_HIGH_TO_LOW: 'Rating: High to Low',
  VACANT_SPACES: 'Most Vacant Spaces',
  NONE: 'No Filter'
};

// Temporary mock data
const MOCK_PARKING_LOTS = [
  {
    id: '1',
    name: 'Downtown Parking',
    location: '123 Main St',
    vacantSpaces: 15,
    feePerHour: 5,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'City Center Garage',
    location: '456 Market St',
    vacantSpaces: 8,
    feePerHour: 7,
    rating: 3.8,
  },
  {
    id: '3',
    name: 'Riverside Parking',
    location: '789 River Rd',
    vacantSpaces: 20,
    feePerHour: 4,
    rating: 4.2,
  },
];

const DashboardScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parkingLots, setParkingLots] = useState([]);
  const [filteredParkingLots, setFilteredParkingLots] = useState([]);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(FILTER_OPTIONS.NONE);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  useEffect(() => {
    filterParkingLots();
  }, [searchQuery, parkingLots, currentFilter]);

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const data = await api.getParkingLots();
      setParkingLots(data);
      setFilteredParkingLots(data);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      // Fallback to mock data if API fails
      setParkingLots(MOCK_PARKING_LOTS);
      setFilteredParkingLots(MOCK_PARKING_LOTS);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (lots) => {
    switch (currentFilter) {
      case FILTER_OPTIONS.PRICE_LOW_TO_HIGH:
        return [...lots].sort((a, b) => a.feePerHour - b.feePerHour);
      case FILTER_OPTIONS.PRICE_HIGH_TO_LOW:
        return [...lots].sort((a, b) => b.feePerHour - a.feePerHour);
      case FILTER_OPTIONS.RATING_HIGH_TO_LOW:
        return [...lots].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case FILTER_OPTIONS.VACANT_SPACES:
        return [...lots].sort((a, b) => b.vacantSpaces - a.vacantSpaces);
      default:
        return lots;
    }
  };

  const filterParkingLots = () => {
    let filtered = parkingLots;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lot => {
        const name = lot.name.toLowerCase();
        const location = lot.location.toLowerCase();
        const searchWords = query.split(/\s+/);
        return searchWords.some(word => 
          name.includes(word) || location.includes(word)
        );
      });
    }

    // Apply sorting filter
    filtered = applyFilter(filtered);
    setFilteredParkingLots(filtered);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchParkingLots().finally(() => setRefreshing(false));
  }, []);

  const renderParkingLot = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ParkingLotDetails', { parkingLot: item })}>
      <Card.Content>
        <Text style={styles.parkingName}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={item.rating || 0} size={16} />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Vacant Spaces</Text>
            <Text style={styles.detailValue}>{item.vacantSpaces}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fee/Hour</Text>
            <Text style={styles.detailValue}>${item.feePerHour}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => navigation.navigate('ParkingLotDetails', { parkingLot: item })}>
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search parking lots..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
            >
              {currentFilter}
            </Button>
          }
        >
          {Object.values(FILTER_OPTIONS).map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setCurrentFilter(option);
                setFilterMenuVisible(false);
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>
      
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={filteredParkingLots}
          renderItem={renderParkingLot}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No parking lots found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 4,
  },
  filterButton: {
    minWidth: 120,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  parkingName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DashboardScreen; 