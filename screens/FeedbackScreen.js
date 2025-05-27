import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FeedbackScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Yaay!</Text>
      <Text style={styles.subtitle}>We value all feedback, please rate your experience below:</Text>
      <View style={styles.stars}>
        {['★', '★', '★', '★', '★'].map((star, index) => (
          <Text key={index} style={styles.star}>★</Text>
        ))}
      </View>
      <Text style={styles.thankYou}>Thank you for helping us improve our service!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  header: { fontSize: 20, color: '#f28c38', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#fff', textAlign: 'center', marginBottom: 20 },
  stars: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 30, color: '#f28c38', marginHorizontal: 5 },
  thankYou: { fontSize: 14, color: '#fff', textAlign: 'center' },
});
