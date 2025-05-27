import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CheckoutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      <Text style={styles.price}>Frw 16,000 (including VAT 18%)</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PaymentSuccess')}>
        <Text style={styles.buttonText}>Pay for the order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { fontSize: 18, color: '#f28c38', marginBottom: 20 },
  price: { fontSize: 16, color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
