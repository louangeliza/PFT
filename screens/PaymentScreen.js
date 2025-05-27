import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, RadioButton, Divider } from 'react-native-paper';

const PaymentScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // TODO: Implement payment logic with MockAPI
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PaymentSuccess', { booking });
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Payment</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>${booking.actualFee}</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          <RadioButton.Group
            onValueChange={value => setPaymentMethod(value)}
            value={paymentMethod}
          >
            <View style={styles.paymentOption}>
              <RadioButton value="card" />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>Credit/Debit Card</Text>
                <Text style={styles.paymentOptionDescription}>
                  Pay with Visa, Mastercard, or other cards
                </Text>
              </View>
            </View>

            <View style={styles.paymentOption}>
              <RadioButton value="wallet" />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>Digital Wallet</Text>
                <Text style={styles.paymentOptionDescription}>
                  Pay with Apple Pay, Google Pay, or other wallets
                </Text>
              </View>
            </View>

            <View style={styles.paymentOption}>
              <RadioButton value="bank" />
              <View style={styles.paymentOptionContent}>
                <Text style={styles.paymentOptionTitle}>Bank Transfer</Text>
                <Text style={styles.paymentOptionDescription}>
                  Pay directly from your bank account
                </Text>
              </View>
            </View>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.payButton}
            loading={loading}
            disabled={loading}
          >
            Pay ${booking.actualFee}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  divider: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentOptionContent: {
    marginLeft: 8,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  payButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default PaymentScreen; 