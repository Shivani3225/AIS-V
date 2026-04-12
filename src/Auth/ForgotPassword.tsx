import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Email Validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Email is invalid');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: email.toLowerCase().trim(),
      });

      const data = response.data;
      console.log('Forgot password response:', data);

      if (data.success) {
        setModalMessage(data.message);
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.log('Forgot password error:', error.response?.data || error.message);

      // Always show generic message for security
      if (error.response?.status === 400) {
        setErrorMessage(error.response.data.message || 'Please provide a valid email');
      } else if (error.response?.status === 500) {
        setErrorMessage('Server error. Please try again later.');
      } else {
        // For any other error, show success modal anyway (security best practice)
        setModalMessage('If an account exists with that email, a reset link has been sent.');
        setShowSuccessModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setEmail(''); // Optional: Clear email after successful request
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ICON */}
        <View style={styles.iconCircle}>
          <Icon name="mail" size={24} color="#7C3AED" />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          No worries! Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Text style={styles.label}>Email Address *</Text>

        <View style={styles.inputBox}>
          <Icon name="mail" size={18} color="#8E8E98" />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
          <LinearGradient
            colors={loading ? ['#A5B4FC', '#93C5FD'] : ['#7C3AED', '#3B82F6']}
            style={styles.button}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}> Sending Reset Link...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.support}>
          Need help? Contact us at support@example.com
        </Text>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.modalIconGradient}
              >
                <Icon name="check" size={32} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.modalTitle}>Check Your Email</Text>
            
            <Text style={styles.modalMessage}>
              {modalMessage}
            </Text>

            <TouchableOpacity onPress={handleCloseModal} style={styles.modalButton}>
              <LinearGradient
                colors={['#7C3AED', '#3B82F6']}
                style={styles.modalButtonGradient}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              handleCloseModal();
              navigation.navigate('Login');
            }}>
              <Text style={styles.modalBackToLogin}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    alignSelf: 'center',
    backgroundColor: '#EDE9FE',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    marginBottom: 5,
    color: '#374151',
    fontWeight: '500',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#1F2937',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  link: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },
  support: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: width - 48,
    maxWidth: 340,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  modalInfoText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  modalSubText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    marginBottom: 12,
  },
  modalButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackToLogin: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ForgotPassword;