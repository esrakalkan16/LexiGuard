import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ContractsProvider } from './src/context/ContractsContext';

const App = () => {
  return (
    <>
      {/* Üst barı (saat, pil simgesi) şık ve görünür yapıyoruz */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ContractsProvider>
        <AppNavigator />
      </ContractsProvider>
    </>
  );
};

export default App;
