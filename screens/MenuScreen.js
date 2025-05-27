import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const menuItems = [
  { id: '1', category: 'Drinks', name: 'Tom Yummy', price: 'Frw 5,000', time: '12.5' },
  { id: '2', category: 'Drinks', name: 'Singapore Sling', price: 'Frw 5,000', time: '12.5' },
  // Add more items
];

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Kigali</Text>
      <Text style={styles.category}>Drinks</Text>
      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} - {item.price}</Text>
            <Text>{item.time}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Checkout')}>
        <Text style={styles.buttonText}>Proceed to checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 18, color: '#f28c38', padding: 10 },
  category: { fontSize: 16, color: '#f28c38', padding: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  button: { backgroundColor: '#f28c38', padding: 10, borderRadius: 5, margin: 10 },
  buttonText: { color: '#fff', textAlign: 'center' },
});
