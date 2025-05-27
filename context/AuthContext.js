import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);
const SESSION_KEY = '@auth_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app start
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const { userData, timestamp } = JSON.parse(sessionData);
        const now = new Date().getTime();
        
        // Check if session is still valid (within 30 minutes)
        if (now - timestamp < SESSION_TIMEOUT) {
          setUser(userData);
        } else {
          // Session expired
          await AsyncStorage.removeItem(SESSION_KEY);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (userData) => {
    try {
      const sessionData = {
        userData,
        timestamp: new Date().getTime()
      };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Session save error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process');
      setLoading(true);
      setError(null);
      
      // Call the API login function
      console.log('AuthContext: Calling API login');
      const userData = await api.login(email, password);
      console.log('AuthContext: API login response:', userData ? 'Success' : 'Failed');
      
      if (!userData) {
        console.log('AuthContext: Login failed - no user data returned');
        setError('Login failed. Please try again.');
        return false;
      }
      
      // Save user data and session
      console.log('AuthContext: Saving user session');
      setUser(userData);
      await saveSession(userData);
      console.log('AuthContext: Login successful');
      return true;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await api.register(userData);
      setUser(newUser);
      await saveSession(newUser);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      login, 
      logout, 
      register,
      loading,
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 