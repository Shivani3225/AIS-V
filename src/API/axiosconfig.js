import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================
// ENV URLs
// =============================================
const ANDROID_EMULATOR = "http://10.0.2.2:5000/api";
const IOS_SIMULATOR = "http://localhost:5000/api";
const PRODUCTION = "https://my-backend-dnj5.onrender.com/api";

// =============================================
// SELECT ENV
// =============================================
const BASE_URL = PRODUCTION;

console.log('🌐 Using Base URL:', BASE_URL);

// =============================================
// AXIOS INSTANCE
// =============================================
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 🔥 FIX: 30 seconds (VERY IMPORTANT)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// =============================================
// REQUEST INTERCEPTOR
// =============================================
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("vendorToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🚀 API Request:', {
      method: config.method.toUpperCase(),
      url: config.baseURL + config.url,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// =============================================
// RESPONSE INTERCEPTOR + AUTO RETRY
// =============================================
API.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {

    const originalRequest = error.config;

    // 🔥 AUTO RETRY (ONLY ONCE)
    if (
      error.message === 'Network Error' &&
      !originalRequest._retry
    ) {
      console.log("🔄 Retrying request after delay...");

      originalRequest._retry = true;

      await new Promise(res => setTimeout(res, 2000)); // wait 5 sec

      return API(originalRequest);
    }

    // 🔴 TIMEOUT ERROR
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request Timeout');
    }

    // 🔴 NETWORK ERROR
    else if (error.message === 'Network Error') {
      console.error('❌ Network Error - Server may be waking up (Render cold start)');
    }

    return Promise.reject(error);
  }
);

export default API;