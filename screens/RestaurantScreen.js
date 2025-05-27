import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

const restaurants = [
  { id: '1', name: 'Choose Kigali', description: 'World African, Pizzeria, Coffee' },
  { id: '2', name: 'Choose Kigali', description: 'World African, Pizzeria, Coffee' },
];

export default function RestaurantScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nearby Restaurant</Text>
      <FlatList
        data={restaurants}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Menu')}>
            <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.image} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 10 }, // Adjusted for navbar
  header: { fontSize: 18, color: '#f28c38', padding: 10 },
  item: { flexDirection: 'row', padding: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  image: { width: 50, height: 50, marginRight: 10 },
  name: { fontSize: 16 },
  description: { fontSize: 12, color: '#666' },
});
