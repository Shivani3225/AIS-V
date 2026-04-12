// screens/Auth/SplashScreen.js
import React from 'react';
import { useEffect } from 'react';  
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
const SplashScreen = () => {
  const navigation = useNavigation();
  const handleGetStarted = () => {
    console.log('Get Started pressed');
  };
  useEffect(() => {
    // Automatic navigation after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffff" barStyle="dark-content" />


      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* AIS Logo - Circular and Big */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Image source={require('../assets/Logo.png')} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
          </View>
        </View>

        {/* Main Heading - Black Color Big Fonts */}
        <Text style={styles.mainHeading}>
          FIND VENDORS IN ONE PLACE
        </Text>

        {/* Description Text - Small Grey Color */}
        <Text style={styles.description}>
          Discover exciting events happening near you invite others to join.
        </Text>

        {/* Get Started Button - Blue Color */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Let's get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#f9efef', // White background
    backgroundColor: '#F3F0FF'
  },
  timeContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  logoWrapper: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 160, // Big size
    height: 160, // Big size
    borderRadius: 80, // Half of width/height for perfect circle
  },
  logoText: {
    fontSize: 48, // Big font
    fontWeight: 'bold',
    color: '#f3f0f0', // Dark grey color for AIS text
  },
  mainHeading: {
    fontSize: 30, // Big fonts
    fontWeight: '800',
    color: '#000000', // Black color
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: '#727272', // Grey color
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: '#2929e6', // Blue color
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#0066FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF', // White text
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;