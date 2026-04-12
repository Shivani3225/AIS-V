import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/Appnavigator';
import RazorpayCheckout from 'react-native-razorpay';
import { Platform } from 'react-native';

const App = () => {

  useEffect(() => {
    console.log('RazorpayCheckout:', RazorpayCheckout);
    console.log('Platform:', Platform.OS);
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;