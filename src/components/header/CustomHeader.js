import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from "../Notification";

const CustomHeader = () => {
  const navigation = useNavigation();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: performLogout,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      
      // Clear all stored vendor-related data
      const keysToRemove = [
        'vendorToken',
        'vendorData',
        'vendorId',
        'userData', // if any
        'authToken', // if any
        'googleToken', // if any
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      // Alternative: Clear all AsyncStorage (if you want to clear everything)
      // await AsyncStorage.clear();
      
      console.log("✅ All vendor data cleared successfully");
      
      // Navigate to login screen
      navigation.replace('Login');
      
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert(
        'Error',
        'Failed to logout. Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8f9ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.wrapper}>
          {/* LEFT SECTION */}
          <View style={styles.leftSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>A</Text>
            </View>

            <View>
              <Text style={styles.title}>AIS Vendor Panel</Text>
              <Text style={styles.subtitle}>Event Management</Text>
            </View>
          </View>

          {/* RIGHT SECTION */}
          <View style={styles.rightSection}>
            {/* Notification Bell */}
            <Notification />

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Icon name="log-out-outline" size={22} color='red' />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingTop: 10,
  },

  headerCard: {
    borderRadius: 16,
    padding: 1.2,
  },

  wrapper: {
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,

    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  logoutButton: {
    padding: 4,
  },
});