// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Notification from "../Notification";

// const CustomHeader = () => {
//   const navigation = useNavigation();
//   const [loggingOut, setLoggingOut] = React.useState(false);

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Logout',
//           onPress: performLogout,
//           style: 'destructive',
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   const performLogout = async () => {
//     try {
//       setLoggingOut(true);
      
//       // Clear all stored vendor-related data
//       const keysToRemove = [
//         'vendorToken',
//         'vendorData',
//         'vendorId',
//         'userData', // if any
//         'authToken', // if any
//         'googleToken', // if any
//       ];
      
//       await AsyncStorage.multiRemove(keysToRemove);
      
//       // Alternative: Clear all AsyncStorage (if you want to clear everything)
//       // await AsyncStorage.clear();
      
//       console.log("✅ All vendor data cleared successfully");
      
//       // Navigate to login screen
//       navigation.replace('Login');
      
//     } catch (error) {
//       console.log("Logout error:", error);
//       Alert.alert(
//         'Error',
//         'Failed to logout. Please try again.'
//       );
//     } finally {
//       setLoggingOut(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#ffffff', '#f8f9ff']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerCard}
//       >
//         <View style={styles.wrapper}>
//           {/* LEFT SECTION */}
//           <View style={styles.leftSection}>
//             <View style={styles.logoBox}>
//               <Text style={styles.logoText}>A</Text>
//             </View>

//             <View>
//               <Text style={styles.title}>AIS Vendor Panel</Text>
//               <Text style={styles.subtitle}>Event Management</Text>
//             </View>
//           </View>

//           {/* RIGHT SECTION */}
//           <View style={styles.rightSection}>
//             {/* Notification Bell */}
//             <Notification />

//             {/* Logout Button */}
//             <TouchableOpacity 
//               style={styles.logoutButton}
//               onPress={handleLogout}
//               disabled={loggingOut}
//             >
//               {loggingOut ? (
//                 <ActivityIndicator size="small" color="#4f46e5" />
//               ) : (
//                 <Icon name="log-out-outline" size={22} color='red' />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </LinearGradient>
//     </View>
//   );
// };

// export default CustomHeader;

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 12,
//     paddingTop: 10,
//   },

//   headerCard: {
//     borderRadius: 16,
//     padding: 1.2,
//   },

//   wrapper: {
//     height: 64,
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 14,

//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 4,
//   },

//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   logoBox: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: '#4f46e5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,

//     shadowColor: '#4f46e5',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.4,
//     shadowRadius: 4,
//     elevation: 4,
//   },

//   logoText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '700',
//   },

//   title: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },

//   subtitle: {
//     fontSize: 11,
//     color: '#6b7280',
//   },

//   rightSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },

//   logoutButton: {
//     padding: 4,
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from "../Notification";

const CustomHeader = () => {
  const navigation = useNavigation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  
  // Message state
  const [message, setMessage] = useState({ visible: false, text: "", type: "success" });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setMessage({ ...message, visible: false });
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message.visible]);

  const showMessage = (text, type = "success") => {
    setMessage({ visible: true, text, type });
  };

  const handleLogout = () => {
    setConfirmModalVisible(true);
  };

  const performLogout = async () => {
    try {
      setLoggingOut(true);
      setConfirmModalVisible(false);
      
      // Clear all stored vendor-related data
      const keysToRemove = [
        'vendorToken',
        'vendorData',
        'vendorId',
        'userData',
        'authToken',
        'googleToken',
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      console.log("✅ All vendor data cleared successfully");
      showMessage("Logged out successfully", "success");
      
      // Navigate to login screen after a short delay
      setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
      
    } catch (error) {
      console.log("Logout error:", error);
      showMessage("Failed to logout. Please try again.", "error");
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Message Toast */}
      {message.visible && (
        <Animated.View 
          style={[
            styles.messageContainer,
            message.type === "success" ? styles.messageSuccess : styles.messageError,
            { opacity: fadeAnim }
          ]}
        >
          <Icon 
            name={message.type === "success" ? "checkmark-circle" : "alert-circle"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

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

      {/* Custom Confirm Logout Modal */}
      <Modal visible={confirmModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalIcon}>
              <Icon name="log-out-outline" size={48} color="#EF4444" />
            </View>
            <Text style={styles.confirmModalTitle}>Logout</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to logout? You will need to login again to access your account.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity style={styles.confirmModalCancelButton} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmModalDeleteButton]} onPress={performLogout}>
                <Text style={styles.confirmModalDeleteText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  messageContainer: {
    position: "absolute",
    top: 70,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageSuccess: {
    backgroundColor: "#10B981",
  },
  messageError: {
    backgroundColor: "#EF4444",
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  confirmModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  confirmModalCancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  confirmModalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  confirmModalDeleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
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