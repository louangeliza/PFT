import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const StarRating = ({ rating, size = 20 }) => {
  // Ensure rating is between 0 and 5
  const normalizedRating = Math.min(Math.max(rating, 0), 5);
  
  // Create array of 5 stars
  const stars = Array(5).fill(0).map((_, index) => {
    const starValue = index + 1;
    const starColor = starValue <= normalizedRating ? '#FFD700' : '#D3D3D3';
    
    return (
      <Text key={index} style={[styles.star, { fontSize: size, color: starColor }]}>
        ★
      </Text>
    );
  });

  return (
    <View style={styles.container}>
      {stars}
      <Text style={[styles.ratingText, { fontSize: size * 0.6 }]}>
        {normalizedRating.toFixed(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 5,
    color: '#666',
  },
});

export default StarRating; 