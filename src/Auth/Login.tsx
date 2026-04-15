import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';

import AsyncStorage from "@react-native-async-storage/async-storage";

Icon.loadFont();

const BASE_URL = 'https://api.aissignatureevent.com/api';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}/vendors/login`, {
        email,
        password,
      });

      const data = response.data;
      console.log("Login response:", data);

      if (data.success) {
        await AsyncStorage.setItem("vendorToken", data.token);
        await AsyncStorage.setItem("vendorData", JSON.stringify(data.data));
        
        const vendorId = data.data?.vendorId || data.data?._id || data.vendorId;
        if (vendorId) {
          await AsyncStorage.setItem("vendorId", vendorId);
          console.log("✅ VendorId saved:", vendorId);
        }

        setSuccessMessage(data.message || "Login successful");

        setTimeout(() => {
          navigation.replace("DashboardScreen");
        }, 1000);
      } else {
        setErrorMessage(data.error?.message || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      if (error.response?.data?.error?.message) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        {/* HEADER */}
        <LinearGradient
          colors={['#5B5BEA', '#8A3BD1', '#E11D48']}
          style={styles.header}
        >
          <Text style={styles.title}>Vendor Portal</Text>
          <Text style={styles.subtitle}>Sign in to manage your business</Text>
        </LinearGradient>

        {/* VENDOR ACCESS BANNER */}
        <View style={styles.vendorcontainer}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            style={styles.iconBox}
          >
            <Icon name="briefcase" size={18} color="#fff" />
          </LinearGradient>

          <View style={styles.vendortextContainer}>
            <Text style={styles.vendortitle}>Vendor Access</Text>
            <Text style={styles.vendorsubtitle}>
              Manage your business dashboard
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* EMAIL */}
          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputBox}>
            <Icon name="mail" size={18} color="#8E8E98" />
            <TextInput
              placeholder="your@email.com"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputBox}>
            <Icon name="lock" size={18} color="#8E8E98" />
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              activeOpacity={0.7}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#8E8E98"
              />
            </TouchableOpacity>
          </View>

          {/* ERROR MESSAGE */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* SUCCESS MESSAGE */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={16} color="#16A34A" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={['#5B5BEA', '#E11D48']}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="briefcase" size={18} color="#fff" />
                  <Text style={styles.loginText}>Login to Dashboard</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* PARTNER LINK */}
          <View style={styles.partnerRow}>
            <Text style={styles.partnerText}>
              Don't have a vendor account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.partnerLink}> ✨ Become a Partner</Text>
            </TouchableOpacity>
          </View>

          {/* INFO BAR */}
          <View style={styles.infoBar}>
            <Icon name="briefcase" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              Vendor accounts have access to business dashboard and analytics
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    margin: 15,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
    color: '#374151',
    fontSize: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 6,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 5,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 10,
    color: '#5B5BEA',
    fontSize: 13,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  vendorcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vendortextContainer: {
    flex: 1,
  },
  vendortitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  vendorsubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#6B7280',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  partnerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  partnerText: {
    color: '#6B7280',
    fontSize: 13,
  },
  partnerLink: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 13,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    marginTop: 25,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  successText: {
    color: "#16A34A",
    fontSize: 13,
    flex: 1,
  },
});

export default Login;