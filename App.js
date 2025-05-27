import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import RootNavigator from './navigation/RootNavigator';

enableScreens();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
