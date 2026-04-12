import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import styles from './RegisterStyling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

const VendorRegistration = () => {
  const navigation = useNavigation();
  
  // ============= STATE VARIABLES =============
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResponse, setRegistrationResponse] = useState(null);
  const [apiError, setApiError] = useState('');

  // Subscription States
  const [vendorToken, setVendorToken] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // API Data States
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Category Step States
  const [showError, setShowError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Business Step States
  const [showBusinessError, setShowBusinessError] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Timing Step States
  const [showTimingError, setShowTimingError] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('06:00 PM');
  const [showOpeningTimePicker, setShowOpeningTimePicker] = useState(false);
  const [showClosingTimePicker, setShowClosingTimePicker] = useState(false);

  // Contact Step States
  const [showContactError, setShowContactError] = useState(false);
  const [contactErrorMessage, setContactErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Photos Step States
  const [showPhotoError, setShowPhotoError] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Pricing Step State
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [priceUnit, setPriceUnit] = useState("Per Event");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [description, setDescription] = useState("");
  
  // Plan Step State
  const [selectedPlan, setSelectedPlan] = useState('Free');

  // Form Data State
  const [formData, setFormData] = useState({
    category: '',
    categoryId: '',
    businessName: '',
    city: '',
    cityId: '',
    pincode: '',
    area: '',
    fullAddress: '',
    timing: '',
    contactName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
    photos: [],
    pricing: 'Moderate',
    plan: 'Premium Plan',
    totalBookings: 0,
  });

  // ============= STEPS CONFIGURATION =============
  const steps = [
    { id: 1, title: 'Category', icon: 'grid' },
    { id: 2, title: 'Business', icon: 'briefcase' },
    { id: 3, title: 'Timing', icon: 'clock' },
    { id: 4, title: 'Contact', icon: 'phone' },
    { id: 5, title: 'Photos', icon: 'camera', optional: true },
    { id: 6, title: 'Pricing', icon: 'dollar-sign' },
    { id: 7, title: 'Plan', icon: 'file-text' },
  ];

  const plans = [
    {
      name: "Free",
      price: "Free",
      icon: "home",
      features: [
        "Basic listing",
        "Up to 5 portfolio images",
        "Standard search visibility",
        "Customer inquiries enabled"
      ]
    },
    {
      name: "Starter",
      price: "₹499 /30 days",
      icon: "zap",
      features: [
        "🎁 First 30 days FREE on first purchase",
        "Verified badge",
        "Up to 15 media files",
        "Higher search ranking",
        "Profile managed by AIS team",
        "Priority customer support"
      ]
    },
    {
      name: "Growth",
      price: "₹999 /30 days",
      icon: "trending-up",
      popular: true,
      features: [
        "🎁 First 30 days FREE on first purchase",
        "Featured placement",
        "Up to 30 media files",
        "Top search priority",
        "Portfolio enhancement",
        "Social media promotion"
      ]
    },
    {
      name: "Premium",
      price: "₹1499 /30 days",
      icon: "award",
      features: [
        "🎁 First 30 days FREE on first purchase",
        "Premium badge",
        "Unlimited media uploads",
        "Maximum visibility",
        "Social media shoutouts",
        "Dedicated optimization"
      ]
    }
  ];

  // ============= SUBSCRIPTION PLAN API FUNCTIONS =============

  // Get token from AsyncStorage
  const getToken = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const vendorTokenStorage = await AsyncStorage.getItem('vendorToken');
      const finalToken = authToken || vendorTokenStorage;
      setVendorToken(finalToken);
      
      if (!finalToken) {
        setApiError('No authentication token found. Please login again.');
      }
    } catch (error) {
      console.log('Error getting token:', error);
      setApiError('Failed to authenticate. Please login again.');
    }
  };

  // Load subscription status
  const loadSubscription = async () => {
    if (!vendorToken) {
      setApiError('Authentication required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: { 
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        setApiError(data.message || 'Failed to load subscription');
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setApiError('Failed to load subscription details');
    }
  };

  // Cancel order if payment fails or user closes modal
  const cancelOrder = async (orderId) => {
    if (!orderId) return;
    
    try {
      await fetch(`${API_BASE_URL}/subscription/cancel-order-auth`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${vendorToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ orderId })
      });
      console.log('Order cancelled:', orderId);
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  // Mark Payment as Failed
  const markPaymentFailed = async (orderId, paymentId, errorDetails) => {
    try {
      await axios.post(`${API_BASE_URL}/subscription/mark-failed`, {
        orderId,
        paymentId,
        error: {
          code: errorDetails?.code,
          description: errorDetails?.description,
          source: errorDetails?.source,
          reason: errorDetails?.reason
        }
      });
    } catch (err) {
      console.error('Failed to mark payment as failed:', err);
    }
  };

  // Verify payment after successful transaction
  const verifyPayment = async (paymentResponse, planKey, orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          planKey
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowPlanModal(false);
        await loadSubscription();
        
        // Check if plan was queued or instantly activated
        if (data.queued && data.upcomingPlan) {
          Alert.alert(
            'Success!',
            `🎉 ${data.upcomingPlan.planName} purchased! It will activate on ${new Date(data.upcomingPlan.scheduledStartDate).toLocaleDateString('en-IN')} when your current plan expires.`
          );
        } else {
          Alert.alert(
            'Success!',
            data.hasBonus
              ? `🎉 ${data.subscription.planName} activated! You got 30 days FREE bonus — ${data.totalDays} days total.`
              : `✅ ${data.subscription.planName} activated for ${data.totalDays} days.`
          );
        }
        setCurrentOrderId(null);
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setApiError(err.message || 'Failed to verify payment');
      Alert.alert('Error', err.message || 'Failed to verify payment. Please contact support with your payment ID if amount was deducted.');
    } finally {
      setPurchasing(false);
    }
  };

  // Initiate payment for subscription
  const initiatePayment = async (planKey) => {
    if (!vendorToken) {
      Alert.alert('Error', 'Please login again to continue');
      return;
    }

    setPurchasing(true);
    setApiError('');

    try {
      console.log('1. Creating order:', planKey);

      // Create order with backend
      const response = await fetch(`${API_BASE_URL}/subscription/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planKey })
      });

      const data = await response.json();
      console.log('2. Order response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }

      const amountInPaise = Number(data.amount);

      if (!amountInPaise || amountInPaise <= 0) {
        throw new Error('Invalid amount');
      }

      setCurrentOrderId(data.orderId);

      // Razorpay checkout options
      const options = {
        key: 'rzp_live_SQbIdkWnB4MDHg', // Replace with your actual Razorpay key
        amount: amountInPaise,
        currency: 'INR',
        name: 'AIS Signature',
        description: data.planName,
        order_id: data.orderId,

        prefill: {
          name: subscription?.vendorName || formData.contactName,
          email: subscription?.vendorEmail || formData.email,
          contact: subscription?.vendorPhone || formData.phone
        },

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false
        },

        external: {
          wallets: ['paytm', 'phonepe']
        },

        theme: {
          color: '#4F46E5'
        },

        modal: {
          ondismiss: () => {
            setPurchasing(false);
            if (currentOrderId) cancelOrder(currentOrderId);
          }
        }
      };

      console.log('3. Opening Razorpay');

      // Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (paymentResponse) => {
          console.log('4. Payment success:', paymentResponse);
          await verifyPayment(paymentResponse, planKey, data.orderId);
        })
        .catch((error) => {
          console.log('5. Payment failed:', error);
          setPurchasing(false);

          if (currentOrderId) cancelOrder(currentOrderId);
          
          Alert.alert('Payment Failed', error?.description || error?.message || 'Payment failed. Please try again.');
        });

    } catch (err) {
      console.log('Error:', err);
      setApiError(err.message);
      setPurchasing(false);
      Alert.alert('Error', err.message);
    }
  };

  // Purchase handler
  const handlePurchase = (planKey) => {
    initiatePayment(planKey);
  };

  // ============= API CALLS =============
  useEffect(() => {
    loadInitialData();
    getToken();
  }, []);

  // Load subscription after token is available
  useEffect(() => {
    if (vendorToken) {
      loadSubscription();
    }
  }, [vendorToken]);

  // Filter categories when search changes
  useEffect(() => {
    if (categorySearch.trim()) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.category?.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categorySearch, categories]);

  // Filter cities when search changes
  useEffect(() => {
    if (citySearch.trim() && citySearch.length >= 2) {
      searchCities(citySearch);
    } else {
      setFilteredCities([]);
    }
  }, [citySearch]);

  // Load initial data (categories only)
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const categoriesResponse = await axios.get(`${API_BASE_URL}/taxonomy/services/all`);
      
      console.log('Categories API Response:', categoriesResponse.data);

      let categoriesData = [];
      if (categoriesResponse.data?.data) {
        categoriesData = categoriesResponse.data.data;
      } else if (Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data;
      } else if (categoriesResponse.data?.services) {
        categoriesData = categoriesResponse.data.services;
      }

      const formattedCategories = categoriesData.map(service => ({
        id: service._id || service.id || service.taxonomyId,
        name: service.name || service.title,
        icon: service.icon || '📋',
        category: service.category || service.parentName || 'Services'
      }));
      
      setCategories(formattedCategories);
      setFilteredCategories(formattedCategories);

    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      
      Alert.alert(
        'Connection Error', 
        'Could not connect to server. Using offline data.'
      );
      
      setCategories([
        { id: '1', name: 'Photographer', icon: '📸', category: 'Photography' },
        { id: '2', name: 'Videographer', icon: '🎥', category: 'Photography' },
        { id: '3', name: 'Makeup Artist', icon: '💄', category: 'Beauty' },
        { id: '4', name: 'DJ', icon: '🎧', category: 'Entertainment' },
        { id: '5', name: 'Caterer', icon: '🍽️', category: 'Food' },
      ]);
      setFilteredCategories([
        { id: '1', name: 'Photographer', icon: '📸', category: 'Photography' },
        { id: '2', name: 'Videographer', icon: '🎥', category: 'Photography' },
        { id: '3', name: 'Makeup Artist', icon: '💄', category: 'Beauty' },
        { id: '4', name: 'DJ', icon: '🎧', category: 'Entertainment' },
        { id: '5', name: 'Caterer', icon: '🍽️', category: 'Food' },
      ]);
      
    } finally {
      setLoadingData(false);
    }
  };

  // Search cities API
  const searchCities = async (query) => {
    if (query.length < 2) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/locations/cities/search?q=${encodeURIComponent(query)}&limit=20`);
      
      if (response.data?.success && response.data?.data) {
        const formattedCities = response.data.data.map(city => ({
          id: city.id || city._id,
          osm_id: city.osm_id,
          name: city.name,
          state: city.state || '',
          placeType: city.placeType,
          lat: city.lat,
          lon: city.lon,
          areaCount: city.areaCount || 0
        }));
        
        setCities(formattedCities);
        setFilteredCities(formattedCities);
      }
    } catch (error) {
      console.error('❌ Failed to search cities:', error);
      setFilteredCities([]);
    }
  };

  // ============= HELPER FUNCTIONS =============

  const getPlanId = (planName) => {
    const planNameMap = {
      'Free': 'free',
      'Starter': 'starter',
      'Growth': 'growth',
      'Premium': 'premium'
    };
    return planNameMap[planName] || 'free';
  };

  // Category Handlers
  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name);
    setSelectedCategoryId(category.id);
    setManualCategory('');
    setShowError(false);
    setFormData({ ...formData, category: category.name, categoryId: category.id });
    setShowCategoryDropdown(false);
    setCategorySearch(category.name);
  };

  const handleManualCategoryChange = (text) => {
    setManualCategory(text);
    if (text.length > 0) {
      setSelectedCategory('');
      setSelectedCategoryId('');
      setShowError(false);
      setFormData({ ...formData, category: text, categoryId: '' });
    }
  };

  // City Handlers
  const handleCitySelect = (city) => {
    setFormData({ 
      ...formData, 
      city: city.name,
      cityId: city.id
    });
    setCitySearch(city.name);
    setShowCityDropdown(false);
    setShowBusinessError(false);
  };

  // Timing Handlers
  const handleDayToggle = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
    setShowTimingError(false);
  };

  // Photo Handlers
  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      selectionLimit: 5 - selectedPhotos.length,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        setPhotoErrorMessage('Error selecting photos');
        setShowPhotoError(true);
      } else {
        const newPhotos = response.assets.map(asset => ({
          uri: asset.uri,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          type: asset.type,
        }));

        const oversizedPhotos = newPhotos.filter(photo => photo.fileSize > 5 * 1024 * 1024);
        if (oversizedPhotos.length > 0) {
          setPhotoErrorMessage('Some photos exceed 5MB limit');
          setShowPhotoError(true);
          return;
        }

        setSelectedPhotos([...selectedPhotos, ...newPhotos]);
        setFormData({ ...formData, photos: [...selectedPhotos, ...newPhotos] });
        setShowPhotoError(false);
      }
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(updatedPhotos);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  // Pricing Handler
  const handlePricingSelect = (pricing) => {
    setSelectedPricing(pricing);
    setFormData({ ...formData, pricing: pricing });
  };

  // Plan Handler
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setFormData({ ...formData, plan: plan });
  };

  // ============= API INTEGRATION =============
 const prepareVendorData = () => {
  // ✅ FIX: Get minPrice and maxPrice from state variables
  const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : 0;
  const averagePrice = (minPriceNum + maxPriceNum) / 2;
  const priceUnitValue = priceUnit.toLowerCase().replace(' ', '_') || 'per_event';
  
  const descriptionValue = formData.description || description || '';
  
  const formattedPhotos = selectedPhotos && Array.isArray(selectedPhotos) 
    ? selectedPhotos.map(photo => ({ 
        url: photo.uri, 
        isPrimary: false,
        fileName: photo.fileName,
        fileSize: photo.fileSize
      }))
    : [];
  
  const cityName = formData.city ? formData.city.trim() : '';
  const areaName = formData.area ? formData.area.trim() : '';
  const pincodeValue = formData.pincode ? formData.pincode.trim() : '';
  const cleanAddress = `${areaName}, ${cityName}, ${pincodeValue}`.trim();
  
  const serviceAreasArray = areaName 
    ? [
        {
          name: areaName,
          city: cityName,
          pincode: pincodeValue,
          isPrimary: true
        }
      ] 
    : [];
  
  const vendorData = {
    name: formData.contactName || '',
    businessName: formData.businessName || '',
    description: descriptionValue || '',
    serviceType: selectedCategory || manualCategory || '',
    city: cityName,
    area: areaName,
    pincode: pincodeValue,
    address: cleanAddress,
    landmark: formData.landmark || '',
    pricing: {
      min: minPriceNum,        // ✅ Now using minPrice state
      max: maxPriceNum,        // ✅ Now using maxPrice state
      average: Math.floor(averagePrice),
      unit: priceUnitValue,
      currency: 'INR'
    },
    contact: {
      name: formData.contactName || '',
      phone: formData.phone || '',
      email: (formData.email || '').toLowerCase().trim(),
      whatsapp: formData.phone || '',
      website: formData.website || '',
      socialMedia: {}
    },
    password: formData.password || '',
    photos: formattedPhotos,
    subscription: {
      planId: getPlanId(selectedPlan),
      planName: selectedPlan.toLowerCase(),
      status: 'active',
      startDate: new Date().toISOString(),
      firstPaidBonusUsed: false
    },
    serviceAreas: serviceAreasArray,
    totalBookings: 0,
    yearsInBusiness: 0,
    verified: false,
    isActive: true,
    filters: {},
    portfolio: []
  };
  
  console.log('========== PRICING DATA DEBUG ==========');
  console.log('Min Price:', minPriceNum);
  console.log('Max Price:', maxPriceNum);
  console.log('Average Price:', Math.floor(averagePrice));
  console.log('Price Unit:', priceUnitValue);
  console.log('========================================');
  
  console.log('========== LOCATION DATA DEBUG ==========');
  console.log('City:', cityName);
  console.log('Area:', areaName);
  console.log('Pincode:', pincodeValue);
  console.log('Address (simplified):', cleanAddress);
  console.log('========================================');
  
  return vendorData;
};
  // Register Vendor with Payment Integration
  const registerVendor = async () => {
    try {
      const vendorData = prepareVendorData();
      
      if (!vendorData.contact || !vendorData.contact.email) {
        console.error('❌ CONTACT EMAIL IS MISSING!');
        throw new Error('Contact email is missing from registration data');
      }
      
      // For paid plans, create order first
      if (selectedPlan !== 'Free') {
        return await handlePaidPlanRegistration(vendorData);
      }
      
      // For free plan, direct registration
      const response = await axios.post(
        `${API_BASE_URL}/vendors/register`,
        vendorData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      console.log('Free plan registration response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Registration error details:', error);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
        throw error.response.data;
      } else if (error.request) {
        throw {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network error. Please check your internet connection.',
          }
        };
      } else {
        throw {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'An unexpected error occurred.',
          }
        };
      }
    }
  };

  // Handle Paid Plan Registration (with Razorpay)
  const handlePaidPlanRegistration = async (vendorData) => {
    try {
      // Step 1: Create order
      const orderResponse = await axios.post(`${API_BASE_URL}/subscription/create`, {
        planKey: getPlanId(selectedPlan),
        vendorData: vendorData
      });

      const orderData = orderResponse.data;

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: 'rzp_live_SQbIdkWnB4MDHg', // Replace with your actual key
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'AIS Signature',
        description: `${selectedPlan} Plan - ₹${orderData.planPrice}/30 days`,
        handler: async (paymentResponse) => {
          // Step 3: Complete registration after payment
          await completePaidPlanRegistration(paymentResponse, vendorData);
        },
        prefill: {
          name: formData.contactName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          plan: selectedPlan,
          duration: '30 days'
        },
        theme: {
          color: '#5B5BEA'
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            Alert.alert('Payment Cancelled', 'You cancelled the payment. Please try again.');
            cancelOrder(orderData.orderId);
          }
        }
      };

      // Check if Razorpay is available
      if (RazorpayCheckout) {
        RazorpayCheckout.open(options)
          .then(async (paymentResponse) => {
            console.log('Payment success:', paymentResponse);
            await completePaidPlanRegistration(paymentResponse, vendorData);
          })
          .catch((error) => {
            console.error('Payment failed:', error);
            Alert.alert('Payment Failed', error.description || 'Payment failed. Please try again.');
            
            const failedOrderId = orderData.orderId;
            markPaymentFailed(failedOrderId, null, {
              code: error.code,
              description: error.description,
              source: 'razorpay'
            });
            
            setIsSubmitting(false);
          });
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  };

  // Complete registration after successful payment
  const completePaidPlanRegistration = async (paymentResponse, vendorData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/subscription/complete-registration`, {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        vendorData: {
          ...vendorData,
          subscription: {
            planKey: getPlanId(selectedPlan),
            planName: selectedPlan.toLowerCase()
          }
        }
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Registration verification failed');
      }

      return data;
      
    } catch (error) {
      console.error('Registration completion error:', error);
      throw error;
    }
  };

  // ============= VALIDATION FUNCTION =============
  const validateStep = () => {
    if (currentStep === 1) {
      if (!selectedCategory && !manualCategory) {
        setShowError(true);
        Alert.alert('Validation Error', 'Please select or enter a business category');
        return false;
      }
    } 
    else if (currentStep === 2) {
      if (!formData.businessName) {
        setShowBusinessError(true);
        Alert.alert('Validation Error', 'Business name is required');
        return false;
      }
      if (!formData.pincode) {
        setShowBusinessError(true);
        Alert.alert('Validation Error', 'Pincode is required');
        return false;
      }
      if (!formData.area || formData.area.trim() === '') {
        setShowBusinessError(true);
        Alert.alert('Validation Error', 'Area/Locality is required');
        return false;
      }
      if (!formData.city) {
        setShowBusinessError(true);
        Alert.alert('Validation Error', 'City is required');
        return false;
      }
      if (!formData.cityId) {
        setShowBusinessError(true);
        Alert.alert('Validation Error', 'Please select a valid city from the dropdown');
        return false;
      }
    } 
    else if (currentStep === 3) {
      if (selectedDays.length === 0) {
        setShowTimingError(true);
        Alert.alert('Validation Error', 'Please select at least one working day');
        return false;
      }
    } 
    else if (currentStep === 4) {
      if (!formData.contactName || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
        setContactErrorMessage('All fields marked with * are required');
        setShowContactError(true);
        Alert.alert('Validation Error', 'Please fill all required fields');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setContactErrorMessage('Please enter a valid email address');
        setShowContactError(true);
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return false;
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        setContactErrorMessage('Please enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)');
        setShowContactError(true);
        Alert.alert('Validation Error', 'Please enter a valid 10-digit Indian mobile number (starts with 6,7,8,9)');
        return false;
      }

      if (formData.password.length < 6) {
        setContactErrorMessage('Password must be at least 6 characters');
        setShowContactError(true);
        Alert.alert('Validation Error', 'Password must be at least 6 characters');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setContactErrorMessage('Passwords do not match');
        setShowContactError(true);
        Alert.alert('Validation Error', 'Passwords do not match');
        return false;
      }
    } 
    else if (currentStep === 5) {
      return true;
    } 
    else if (currentStep === 6) {
      if (!minPrice || !maxPrice || !priceUnit) {
        Alert.alert('Validation Error', 'Please fill in all pricing fields');
        return false;
      }
      if (parseInt(minPrice) >= parseInt(maxPrice)) {
        Alert.alert('Validation Error', 'Minimum price should be less than maximum price');
        return false;
      }
    } 
    else if (currentStep === 7) {
      if (!selectedPlan) {
        Alert.alert('Validation Error', 'Please select a plan');
        return false;
      }
    }
    
    return true;
  };

  const handleContactChange = (field, value) => {
    console.log(`Setting ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ============= NAVIGATION HANDLER =============
  const handleContinue = async () => {
    if (currentStep === 7) {
      if (!validateStep()) {
        return;
      }

      setIsSubmitting(true);
      setApiError('');

      try {
        const response = await registerVendor();
        
        let token = null;
        let vendorId = null;
        let userData = null;
        
        if (response) {
          if (response.token) {
            token = response.token;
          }
          else if (response.data?.token) {
            token = response.data.token;
          }
          
          if (response.vendorId) {
            vendorId = response.vendorId;
          } else if (response.data?.vendorId) {
            vendorId = response.data.vendorId;
          } else if (response.data?.vendor?._id) {
            vendorId = response.data.vendor._id;
          } else if (response.data?._id) {
            vendorId = response.data._id;
          } else if (response.data?.vendor?.id) {
            vendorId = response.data.vendor.id;
          }
          
          if (response.user) {
            userData = response.user;
          } else if (response.data?.user) {
            userData = response.data.user;
          } else if (response.data?.vendor) {
            userData = response.data.vendor;
          }
        }
        
        if (vendorId) {
          await AsyncStorage.setItem('vendorId', vendorId);
          console.log('✅ VendorId stored successfully:', vendorId);
        }
        
        if (token) {
          await AsyncStorage.setItem('vendorToken', token);
          console.log('✅ Token stored successfully');
        } else {
          console.log('⚠️ No token in response, user will need to login separately');
          if (formData.email) {
            await AsyncStorage.setItem('registeredEmail', formData.email);
          }
        }
        
        if (userData) {
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
        
        setRegistrationResponse(response);
        setShowSuccessModal(true);
        
      } catch (error) {
        console.error('Registration failed:', error);
        
        if (error.error) {
          switch(error.error.code) {
            case 'EMAIL_EXISTS':
              setApiError('This email is already registered. Please use a different email.');
              break;
            case 'INVALID_PASSWORD':
              setApiError('Password must be at least 6 characters long.');
              break;
            case 'VALIDATION_ERROR':
              const errors = error.error.details?.errors || [];
              setApiError(errors.map(e => e.message).join('\n'));
              break;
            case 'NETWORK_ERROR':
              setApiError('Network error. Please check your internet connection.');
              break;
            default:
              setApiError(error.error.message || 'Registration failed. Please try again.');
          }
        } else {
          setApiError('An unexpected error occurred. Please try again.');
        }
        
        Alert.alert('Registration Failed', apiError);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (validateStep()) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // ============= RENDER STEP CONTENT =============
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            {showError && (
              <View style={styles.errorContainer}>
                <FeatherIcon name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>
                  Please select or enter a business category
                </Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Select Business Category</Text>
            <Text style={{ fontSize: 14, color: "#909090", marginBottom: 10 }}>
              Choose your primary service category
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "500", marginBottom: 10 }}>
              Business Category *
            </Text>

            <TouchableOpacity
              style={[styles.searchBox, showError && !selectedCategory && !manualCategory && styles.inputError]}
              onPress={() => setShowCategoryDropdown(true)}
            >
              <FeatherIcon name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search categories..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={categorySearch}
                onChangeText={(text) => {
                  setCategorySearch(text);
                  setShowCategoryDropdown(true);
                }}
                onFocus={() => setShowCategoryDropdown(true)}
              />
              {categorySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearch('')}>
                  <FeatherIcon name="x" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownHeaderText}>
                    {filteredCategories.length > 0 
                      ? `${filteredCategories.length} categories found` 
                      : 'No categories found'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowCategoryDropdown(false)}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                  >
                    <FeatherIcon name="x" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                {loadingData ? (
                  <View style={styles.loadingDropdown}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.id}
                    style={styles.dropdownList}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    bounces={true}
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.dropdownListContent}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedCategoryId === item.id && styles.selectedDropdownItem,
                          index === filteredCategories.length - 1 && styles.lastDropdownItem
                        ]}
                        onPress={() => {
                          handleCategorySelect(item);
                          setShowCategoryDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dropdownItemContent}>
                          <Text style={styles.dropdownItemIcon}>{item.icon || '📋'}</Text>
                          <View style={styles.dropdownItemTextContainer}>
                            <Text style={styles.dropdownItemName}>{item.name}</Text>
                            <Text style={styles.dropdownItemCategory}>{item.category || 'Services'}</Text>
                          </View>
                        </View>
                        {selectedCategoryId === item.id && (
                          <View style={styles.checkMarkContainer}>
                            <FeatherIcon name="check-circle" size={20} color="#10B981" />
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyDropdown}>
                        <FeatherIcon name="search" size={40} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No categories found</Text>
                        <Text style={styles.emptySubText}>
                          Try a different search term or add manually below
                        </Text>
                      </View>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
                  />
                )}
              </View>
            )}

            <View style={styles.manualContainer}>
              <Text style={styles.manualTitle}>Can't find your category?</Text>
              <Text style={styles.manualSubtitle}>
                Enter your service or business category manually below
              </Text>

              <View style={[styles.manualInputBox, showError && !selectedCategory && !manualCategory && styles.inputError]}>
                <TextInput
                  placeholder="e.g. Luxury Wedding Rentals, Event Photography, etc."
                  placeholderTextColor="#9CA3AF"
                  style={styles.manualInput}
                  multiline
                  numberOfLines={2}
                  value={manualCategory}
                  onChangeText={handleManualCategoryChange}
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            {showBusinessError && (
              <View style={styles.errorContainer}>
                <FeatherIcon name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>
                  All business fields marked with * are required
                </Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Business Information</Text>
            <Text style={styles.stepSubtitle}>Tell us about your business</Text>

            <Text style={styles.inputLabel}>Business Name *</Text>
            <View style={[styles.inputBox, showBusinessError && !formData.businessName && styles.inputError]}>
              <FeatherIcon name="briefcase" size={18} color="#8E8E98" />
              <TextInput
                placeholder="Enter your business name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={formData.businessName}
                onChangeText={(text) => {
                  setFormData({ ...formData, businessName: text });
                  setShowBusinessError(false);
                }}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfContainer}>
                <Text style={styles.inputLabel}>City *</Text>
                <TouchableOpacity
                  style={[styles.dropdownBox, showBusinessError && !formData.city && styles.inputError]}
                  onPress={() => setShowCityDropdown(true)}
                >
                  <Text style={[styles.dropdownText, !formData.city && styles.placeholderText]}>
                    {formData.city || "Select City"}
                  </Text>
                  <FeatherIcon name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                {showCityDropdown && (
                  <View style={styles.cityDropdownContainer}>
                    <View style={styles.citySearchBox}>
                      <FeatherIcon name="search" size={16} color="#9CA3AF" />
                      <TextInput
                        placeholder="Type at least 2 characters..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.citySearchInput}
                        value={citySearch}
                        onChangeText={setCitySearch}
                        autoFocus
                      />
                    </View>
                    
                    {citySearch.length >= 2 ? (
                      filteredCities.length > 0 ? (
                        <FlatList
                          data={filteredCities}
                          keyExtractor={(item) => item.id}
                          style={styles.cityDropdownList}
                          showsVerticalScrollIndicator={false}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={[
                                styles.cityDropdownItem,
                                formData.city === item.name && styles.selectedCityItem
                              ]}
                              onPress={() => handleCitySelect(item)}
                            >
                              <View>
                                <Text style={styles.cityName}>{item.name}</Text>
                                {item.state ? (
                                  <Text style={styles.cityState}>{item.state}</Text>
                                ) : null}
                              </View>
                              {formData.city === item.name && (
                                <FeatherIcon name="check" size={18} color="#10B981" />
                              )}
                            </TouchableOpacity>
                          )}
                        />
                      ) : (
                        <View style={styles.emptyDropdown}>
                          <Text style={styles.emptyText}>No cities found</Text>
                        </View>
                      )
                    ) : (
                      <View style={styles.emptyDropdown}>
                        <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.halfContainer}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <View style={[styles.inputBox, showBusinessError && !formData.pincode && styles.inputError]}>
                  <TextInput
                    placeholder="452001"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChangeText={(text) => {
                      setFormData({ ...formData, pincode: text });
                      setShowBusinessError(false);
                    }}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Area/Locality *</Text>
            <View style={[styles.inputBox, showBusinessError && !formData.area && styles.inputError]}>
              <FeatherIcon name="map-pin" size={18} color="#8E8E98" />
              <TextInput
                placeholder="e.g., Andheri East, Connaught Place, Indiranagar"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={formData.area}
                onChangeText={(text) => {
                  setFormData({ ...formData, area: text });
                  setShowBusinessError(false);
                }}
              />
            </View>

            <Text style={styles.inputLabel}>Full Address (Optional)</Text>
            <View style={[styles.inputBox, styles.textAreaBox]}>
              <FeatherIcon name="map" size={18} color="#8E8E98" style={styles.textAreaIcon} />
              <TextInput
                placeholder="Building name, street, landmark..."
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={formData.fullAddress}
                onChangeText={(text) => setFormData({ ...formData, fullAddress: text })}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            {showTimingError && (
              <View style={styles.errorContainer}>
                <FeatherIcon name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>
                  Please select at least one working day
                </Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Business Hours</Text>
            <Text style={styles.stepSubtitle}>When are you available?</Text>

            <Text style={styles.sectionLabel}>Working Days *</Text>
            <View style={styles.daysContainer}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(day) && styles.selectedDayChip
                  ]}
                  onPress={() => handleDayToggle(day)}
                >
                  <Text style={[
                    styles.dayChipText,
                    selectedDays.includes(day) && styles.selectedDayChipText
                  ]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeSection}>
              <View style={styles.timeLabelContainer}>
                <Text style={styles.timeLabel}>Opening Time</Text>
              </View>
              <TouchableOpacity
                style={styles.timePickerBox}
                onPress={() => setShowOpeningTimePicker(true)}
              >
                <Text style={styles.timePickerText}>{openingTime}</Text>
                <FeatherIcon name="clock" size={18} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeSection}>
              <View style={styles.timeLabelContainer}>
                <Text style={styles.timeLabel}>Closing Time</Text>
              </View>
              <TouchableOpacity
                style={styles.timePickerBox}
                onPress={() => setShowClosingTimePicker(true)}
              >
                <Text style={styles.timePickerText}>{closingTime}</Text>
                <FeatherIcon name="clock" size={18} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            {showContactError && (
              <View style={styles.errorContainer}>
                <FeatherIcon name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>
                  {contactErrorMessage}
                </Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Contact Information</Text>
            <Text style={styles.stepSubtitle}>How can customers reach you?</Text>

            <Text style={styles.inputLabel}>Contact Person Name *</Text>
            <View style={[styles.inputBox, showContactError && !formData.contactName && styles.inputError]}>
              <FeatherIcon name="user" size={18} color="#8E8E98" />
              <TextInput
                placeholder="Enter name"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={formData.contactName}
                onChangeText={(text) => {
                  setFormData({ ...formData, contactName: text });
                  setShowContactError(false);
                }}
              />
            </View>

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={[styles.inputBox, showContactError && !formData.phone && styles.inputError]}>
              <FeatherIcon name="phone" size={18} color="#8E8E98" />
              <TextInput
                placeholder="10-digit mobile number"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.phone}
                onChangeText={(text) => {
                  setFormData({ ...formData, phone: text });
                  setShowContactError(false);
                }}
              />
            </View>

            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={[styles.inputBox, showContactError && !formData.email && styles.inputError]}>
              <FeatherIcon name="mail" size={18} color="#8E8E98" />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={formData.email}
                onChangeText={(text) => {
                  console.log('Email input changed:', text);
                  setFormData({ ...formData, email: text });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.inputLabel}>Password *</Text>
            <View style={[styles.inputBox, showContactError && !formData.password && styles.inputError]}>
              <FeatherIcon name="lock" size={18} color="#8E8E98" />
              <TextInput
                placeholder="Min 8 characters"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  setShowContactError(false);
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FeatherIcon name={showPassword ? "eye-off" : "eye"} size={18} color="#8E8E98" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={[styles.inputBox, showContactError && !formData.confirmPassword && styles.inputError]}>
              <FeatherIcon name="lock" size={18} color="#8E8E98" />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  setShowContactError(false);
                }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FeatherIcon name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="#8E8E98" />
              </TouchableOpacity>
            </View>

            {formData.password && formData.password.length > 0 && formData.password.length < 8 && (
              <View style={styles.passwordHintContainer}>
                <FeatherIcon name="info" size={14} color="#F59E0B" />
                <Text style={styles.passwordHintText}>
                  Password must be at least 8 characters
                </Text>
              </View>
            )}

            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <View style={styles.passwordHintContainer}>
                <FeatherIcon name="info" size={14} color="#EF4444" />
                <Text style={[styles.passwordHintText, styles.errorHintText]}>
                  Passwords do not match
                </Text>
              </View>
            )}

            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
              <View style={styles.passwordHintContainer}>
                <FeatherIcon name="check-circle" size={14} color="#10B981" />
                <Text style={[styles.passwordHintText, styles.successHintText]}>
                  Passwords match
                </Text>
              </View>
            )}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            {showPhotoError && (
              <View style={styles.errorContainer}>
                <FeatherIcon name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>
                  {photoErrorMessage}
                </Text>
              </View>
            )}

            <Text style={styles.stepTitle}>Add Business Photos</Text>
            <Text style={styles.photoSubtitle}>
              Upload up to 5 photos of your work, venue, or services (Free Plan)
            </Text>

            <View style={styles.tipBox}>
              <FeatherIcon name="info" size={16} color="#3B82F6" />
              <Text style={styles.tipText}>
                Tip: You can add more photos after registration. Upgrade to paid plans for up to 30 images!
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.uploadTitle}>Upload Business Photos</Text>

            <TouchableOpacity
              style={styles.uploadArea}
              onPress={openGallery}
              disabled={selectedPhotos.length >= 5}
            >
              <FeatherIcon name="upload-cloud" size={40} color="#8B5CF6" />
              <Text style={styles.uploadAreaText}>Drag & drop or click to browse</Text>

              <View style={styles.uploadRequirements}>
                <Text style={styles.requirementText}>• JPG, PNG, WEBP</Text>
                <Text style={styles.requirementText}>• Max 5MB each</Text>
                <Text style={styles.requirementText}>• Up to 5 images (Free Plan)</Text>
              </View>

              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.chooseButton}
              >
                <Text style={styles.chooseButtonText}>+ Choose Photos</Text>
              </LinearGradient>
            </TouchableOpacity>

            {selectedPhotos.length > 0 && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>
                  Selected Photos ({selectedPhotos.length}/5)
                </Text>
                <View style={styles.photoPreviewGrid}>
                  {selectedPhotos.map((photo, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removePhoto(index)}
                      >
                        <FeatherIcon name="x" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.fileInfoBadge}>
                        <Text style={styles.fileInfoText}>
                          {(photo.fileSize / (1024 * 1024)).toFixed(1)}MB
                        </Text>
                      </View>
                    </View>
                  ))}

                  {[...Array(5 - selectedPhotos.length)].map((_, index) => (
                    <View key={`empty-${index}`} style={styles.emptyPreview}>
                      <FeatherIcon name="image" size={24} color="#D1D5DB" />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Service Pricing Details</Text>
            <Text style={styles.stepSubtitle}>
              Tell customers about your pricing and experience
            </Text>

            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>1</Text>
                </View>
                <Text style={styles.pricingTitle}>Pricing Range</Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.label}>Minimum Price *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcon name="currency-inr" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="10000"
                      keyboardType="numeric"
                      style={styles.input}
                      value={minPrice}
                      onChangeText={setMinPrice}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Starting price for your services
                  </Text>
                </View>

                <View style={styles.priceBox}>
                  <Text style={styles.label}>Maximum Price *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcon name="currency-inr" size={20} color="#6B7280" />
                    <TextInput
                      placeholder="50000"
                      keyboardType="numeric"
                      style={styles.input}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    Maximum price for premium services
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>2</Text>
                </View>
                <Text style={styles.pricingTitle}>Price Unit</Text>
              </View>

              <Text style={styles.label}>
                How do you charge for your services?
              </Text>

              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => setShowUnitDropdown(!showUnitDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {priceUnit || "Per Event"}
                </Text>
                <FeatherIcon name="chevron-down" size={18} color="#6B7280" />
              </TouchableOpacity>

              {showUnitDropdown && (
                <View style={styles.dropdownList}>
                  {["Per Event", "Per Day", "Per Plate", "Per Person"].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPriceUnit(item);
                        setShowUnitDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.helperText}>
                Select how you typically charge customers
              </Text>
            </View>

            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>3</Text>
                </View>
                <Text style={styles.pricingTitle}>
                  Business Description (Optional)
                </Text>
              </View>

              <Text style={styles.label}>
                Tell customers about your business
              </Text>

              <TextInput
                style={styles.descriptionInput}
                placeholder="Tell customers about your business, experience, and services..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.descriptionFooter}>
                <Text style={styles.helperText}>
                  Share your expertise, experience, and what makes you unique
                </Text>
                <Text style={styles.counterText}>
                  {description.length}/500
                </Text>
              </View>
            </View>

            <View style={styles.importantBox}>
              <View style={styles.importantHeader}>
                <FeatherIcon name="alert-circle" size={18} color="#D97706" />
                <Text style={styles.importantTitle}>Important:</Text>
              </View>
              <Text style={styles.importantText}>
                These prices will be visible to customers. Make sure they accurately
                reflect your service charges.
              </Text>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose Your Visibility Plan</Text>
            <Text style={styles.stepSubtitle}>
              Select a plan that fits your business goals
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoBox}>
                <FeatherIcon name="eye" size={18} color="#2563EB" />
                <Text style={styles.infoText}>
                  Plans affect your visibility on the platform, not your service charges
                </Text>
              </View>

              <View style={styles.bonusBox}>
                <View style={styles.bonusHeader}>
                  <Text style={styles.bonusTitle}>
                    🎉 +30 Bonus Days FREE on First Purchase!
                  </Text>
                </View>
                <Text style={styles.bonusText}>
                  Pay for 30 days, get 60 days total on your first paid plan
                </Text>
                <Text style={styles.bonusSubText}>
                  One-time payment · No auto-renewal · Renew anytime
                </Text>
              </View>
            </View>

            <View style={styles.planContainer}>
              {plans.map((plan, index) => {
                const isSelected = selectedPlan === plan.name;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planCard,
                      isSelected && styles.activePlan
                    ]}
                    onPress={() => setSelectedPlan(plan.name)}
                    activeOpacity={0.9}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Most Popular</Text>
                      </View>
                    )}

                    <View style={styles.planIcon}>
                      <FeatherIcon name={plan.icon} size={22} color="#6D28D9" />
                    </View>

                    <Text style={styles.planTitle}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>

                    <View style={styles.featureList}>
                      {plan.features.map((item, i) => (
                        <View key={i} style={styles.featureRow}>
                          <View style={styles.checkCircle}>
                            <FeatherIcon name="check" size={10} color="#fff" />
                          </View>
                          <Text style={styles.featureText}>{item}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.planButton}>
                      {isSelected ? (
                        <View style={styles.selectedBtn}>
                          <FeatherIcon name="check-circle" size={18} color="#16A34A" />
                          <Text style={styles.selectedText}> Selected</Text>
                        </View>
                      ) : (
                        <Text style={styles.selectText}>Select Plan</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.upgradecontainer}>
              <View style={styles.upgradeiconRow}>
                <FeatherIcon name="award" size={18} color="#7C3AED" />
                <Text style={styles.upgradetitle}>Why upgrade?</Text>
              </View>
              <Text style={styles.upgradedescription}>
                Higher plans get better visibility in search results, featured placements on category pages,
                verified badges that build trust, and priority customer support.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // ============= SUCCESS MODAL =============
  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setShowSuccessModal(false);
        navigation.navigate('Home');
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.successIconWrapper}>
            <View style={styles.successIconCircle}>
              <FeatherIcon name="check" size={40} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.modalTitle}>Registration Successful!</Text>
          
          <Text style={styles.modalMessage}>
            Your account has been created successfully. Please check your email 
            ({formData.email}) for verification.
          </Text>
          
          {registrationResponse?.data?.vendor?._id && (
            <View style={styles.modalVendorCard}>
              <Text style={styles.modalVendorLabel}>Your Vendor ID:</Text>
              <Text style={styles.modalVendorId}>{registrationResponse.data.vendor._id}</Text>
            </View>
          )}
          
          <View style={styles.modalInfoCard}>
            <View style={styles.modalInfoHeader}>
              <FeatherIcon name="clock" size={18} color="#F59E0B" />
              <Text style={styles.modalInfoTitle}>Pending Admin Approval</Text>
            </View>
            <Text style={styles.modalInfoText}>
              Your profile and uploaded photos are pending admin approval. Once approved, 
              your profile will be live and you can login to manage your dashboard.
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.modalLoginButton}
            onPress={() => {
              setShowSuccessModal(false);
              navigation.navigate('Login', { 
                email: formData.email,
                message: 'Registration successful! Please login to continue.'
              });
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#5B5BEA', '#E11D48']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.modalLoginGradient}
            >
              <Text style={styles.modalLoginText}>Login Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ============= MAIN RENDER =============
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#5B5BEA', '#8A3BD1', '#E11D48']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Vendor Registration</Text>
          <Text style={styles.headerSubtitle}>
            Join our platform and grow your business
          </Text>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScroll}
        >
          <View style={styles.stepsContainer}>
            {steps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={styles.stepItem}
                onPress={() => setCurrentStep(step.id)}
              >
                <View style={[
                  styles.stepCircle,
                  currentStep >= step.id && styles.stepCircleActive,
                  currentStep === step.id && styles.stepCircleCurrent
                ]}>
                  <Text style={[
                    styles.stepNumber,
                    currentStep >= step.id && styles.stepNumberActive
                  ]}>{step.id}</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={[
                    styles.stepTitle,
                    currentStep >= step.id && styles.stepTitleActive
                  ]}>{step.title}</Text>
                  {step.optional && (
                    <Text style={styles.optionalText}>(Optional)</Text>
                  )}
                </View>
                {step.id < 7 && (
                  <FeatherIcon
                    name="chevron-right"
                    size={16}
                    color="#9CA3AF"
                    style={styles.stepArrow}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.content}>
          {renderStepContent()}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <FeatherIcon name="arrow-left" size={18} color="#6B7280" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.continueButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={['#5B5BEA', '#E11D48']}
              style={styles.continueGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueText}>
                    {currentStep === 7 ? 'Submit' : 'Continue'}
                  </Text>
                  {currentStep < 7 && (
                    <FeatherIcon name="arrow-right" size={18} color="#fff" />
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={{ marginTop: 10, color: '#4B5563' }}>Registering your business...</Text>
        </View>
      )}

      {renderSuccessModal()}
    </SafeAreaView>
  );
};

export default VendorRegistration;