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
    navigation.navigate('Login');
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
            <Image 
              source={require('../assets/Logo.png')} 
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
            />
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

        {/* Get Started Button - Navy Blue Color */}
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
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f3f0f0',
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: '#727272',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: '#1f1f6b', // Navy blue color
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#1f1f6b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;