import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Button, Text } from 'react-native-paper';

const AuthScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/parking-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>CARGOJET</Text>
        <Text style={styles.subtitle}>Find & Book Parking Spots</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </Button>
          
          <Button
            mode="outlined"
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Register')}
          >
            Register
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 8,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderColor: 'white',
  },
});

export default AuthScreen; 