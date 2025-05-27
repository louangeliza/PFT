import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    card: '#ffffff',
    border: '#e0e0e0',
    placeholder: '#666666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    secondary: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#ffffff',
    error: '#CF6679',
    card: '#2C2C2C',
    border: '#333333',
    placeholder: '#AAAAAA',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
}; 