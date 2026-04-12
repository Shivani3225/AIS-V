import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform,
  FlatList,
  SafeAreaView,
  Animated,
  Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomHeader from '../../components/header/CustomHeader';
import OverView from './OverView';
import VideoContent from './VideoContent';
import PortFolioGallery from './PortFolioGallery';
import BlogPost from './BlogPost';
import Reviews from './Reviews';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

/**
 * Professional Vendor Profile Dashboard with Custom Tabs
 * Instagram + Facebook style profile with real-time editing
 */
const VendorProfileDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get initial tab from navigation params
  const initialTab = route.params?.initialTab || 'overview';

  // Tab state
  const [activeTab, setActiveTab] = useState(initialTab);
  const scrollViewRef = useRef(null);
  const tabScrollViewRef = useRef(null);
  const tabPositions = useRef({});

  // State for profile data that will be shared across tabs
  const [profile, setProfile] = useState({
    _id: null, // Add database ID
    businessName: '',
    ownerName: '',
    serviceType: '',
    description: '',
    city: '',
    area: '',
    address: '',
    contact: '',
    email: '',
    whatsapp: '',
    website: '',
    instagram: '',
    facebook: '',
    yearsInBusiness: '',
    teamSize: '',
    priceRange: {
      min: '',
      max: ''
    },
    profileImage: '',
    coverImage: '',
    verified: false,
    rating: 0,
    totalReviews: 0
  });

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [portfolioVideos, setPortfolioVideos] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vendorId, setVendorId] = useState(null);

  // Tab definitions
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'home' },
    { id: 'profile', name: 'My Profile', icon: 'user' },
    { id: 'media', name: 'Portfolio Gallery', icon: 'image' },
    { id: 'videos', name: 'Video Content', icon: 'video' },
    { id: 'blogs', name: 'Blog Posts', icon: 'file-text' },
    { id: 'reviews', name: 'Reviews', icon: 'star' }
  ];

  // Load all data on mount
  useEffect(() => {
    loadProfile();
    loadPortfolioPhotos();
    loadPortfolioVideos();
    loadBlogPosts();
    loadReviews();
  }, []);

  // Update vendorId when profile has _id
  useEffect(() => {
    if (profile && profile._id) {
      setVendorId(profile._id);
      // Save the correct database ID to AsyncStorage
      AsyncStorage.setItem('vendorId', profile._id).catch(console.error);
      console.log('✅ Saved correct database _id:', profile._id);
    }
  }, [profile._id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/vendor-profile/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const vendor = data.data;
        const planKey = vendor.subscription?.planKey || 'free';
        setCurrentPlan(planKey);

        setProfile({
          _id: vendor._id || vendor.id || null, // Store the database ID
          businessName: vendor.businessName || '',
          ownerName: vendor.name || '',
          serviceType: vendor.serviceType || '',
          description: vendor.description || '',
          city: vendor.city || '',
          area: vendor.area || '',
          address: vendor.address || '',
          contact: vendor.contact?.phone || '',
          email: vendor.contact?.email || vendor.email || '',
          whatsapp: vendor.contact?.whatsapp || '',
          website: vendor.contact?.website || '',
          instagram: vendor.contact?.socialMedia?.instagram || '',
          facebook: vendor.contact?.socialMedia?.facebook || '',
          yearsInBusiness: vendor.yearsInBusiness || '',
          teamSize: vendor.teamSize || '',
          priceRange: {
            min: vendor.pricing?.min || '',
            max: vendor.pricing?.max || ''
          },
          profileImage: vendor.profileImage || '',
          coverImage: vendor.coverImage || '',
          verified: vendor.verified || false,
          rating: vendor.rating || 0,
          totalReviews: vendor.totalReviews || 0
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioPhotos = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const response = await fetch(`${API_BASE_URL}/vendor-media?type=image`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPortfolioPhotos(data.data || []);
      }
    } catch (error) {
      console.error('Error loading portfolio photos:', error);
    }
  };

  const loadPortfolioVideos = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const response = await fetch(`${API_BASE_URL}/vendor-media?type=video`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPortfolioVideos(data.data || []);
      }
    } catch (error) {
      console.error('Error loading portfolio videos:', error);
    }
  };

  const loadBlogPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const response = await fetch(`${API_BASE_URL}/vendor-blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBlogPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const response = await fetch(`${API_BASE_URL}/vendor-profile/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      
      // CRITICAL: Normalize phone numbers BEFORE sending
      const normalizePhone = (value) => {
        const cleaned = String(value || '').replace(/\D/g, '');
        return cleaned.length === 10 ? cleaned : '';
      };
      
      // Normalize URLs
      const normalizeUrl = (value) => {
        const text = String(value || '').trim();
        if (!text) return '';
        if (text.startsWith('http://') || text.startsWith('https://')) return text;
        return `https://${text}`;
      };
      
      // Normalize all phone/URL fields
      const cleanedPhone = normalizePhone(updatedProfile.contact);
      const cleanedWhatsapp = normalizePhone(updatedProfile.whatsapp);
      const cleanedWebsite = normalizeUrl(updatedProfile.website);
      const cleanedFacebook = normalizeUrl(updatedProfile.facebook);
      
      // Prepare the data - ONLY send fields that have changed (like web version)
      const payload = {};
      
      // Only include fields that are different from current profile
      if (updatedProfile.businessName !== profile.businessName) payload.businessName = updatedProfile.businessName;
      if (updatedProfile.ownerName !== profile.ownerName) payload.name = updatedProfile.ownerName;
      if (updatedProfile.serviceType !== profile.serviceType) payload.serviceType = updatedProfile.serviceType;
      if (updatedProfile.description !== profile.description) payload.description = updatedProfile.description;
      if (updatedProfile.city !== profile.city) payload.city = updatedProfile.city;
      if (updatedProfile.area !== profile.area) payload.area = updatedProfile.area;
      if (updatedProfile.address !== profile.address) payload.address = updatedProfile.address;
      if (updatedProfile.instagram !== profile.instagram) payload.instagram = updatedProfile.instagram;
      if (updatedProfile.profileImage !== profile.profileImage) payload.profileImage = updatedProfile.profileImage;
      if (updatedProfile.coverImage !== profile.coverImage) payload.coverImage = updatedProfile.coverImage;
      
      // Handle contact fields
      if (cleanedPhone && cleanedPhone !== normalizePhone(profile.contact)) {
        payload.contact = cleanedPhone;
      }
      
      if (cleanedWhatsapp && cleanedWhatsapp !== normalizePhone(profile.whatsapp)) {
        payload.whatsapp = cleanedWhatsapp;
      }
      
      if (cleanedWebsite !== normalizeUrl(profile.website)) {
        payload.website = cleanedWebsite;
      }
      
      if (cleanedFacebook !== normalizeUrl(profile.facebook)) {
        payload.facebook = cleanedFacebook;
      }
      
      // Handle price range
      if (updatedProfile.priceRange.min !== profile.priceRange.min || 
          updatedProfile.priceRange.max !== profile.priceRange.max) {
        payload.priceRange = {
          min: updatedProfile.priceRange.min === '' ? undefined : Number(updatedProfile.priceRange.min),
          max: updatedProfile.priceRange.max === '' ? undefined : Number(updatedProfile.priceRange.max)
        };
      }
      
      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
      
      // If nothing changed, don't send
      if (Object.keys(payload).length === 0) {
        return { success: true, message: 'No changes to save' };
      }
      
      const response = await fetch(`${API_BASE_URL}/vendor-profile/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Update response:', data);
      
      if (data.success) {
        await loadProfile();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleTabPress = (tabId, index) => {
    setActiveTab(tabId);

    // Scroll to the tab in the tab bar
    if (tabScrollViewRef.current && tabPositions.current[tabId]) {
      tabScrollViewRef.current.scrollTo({
        x: tabPositions.current[tabId] - width / 2 + 50,
        animated: true
      });
    }

    // Scroll to top of content when changing tabs
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const renderTabContent = () => {
    const sharedData = {
      profile,
      setProfile,
      currentPlan,
      portfolioPhotos,
      setPortfolioPhotos,
      portfolioVideos,
      setPortfolioVideos,
      blogPosts,
      setBlogPosts,
      reviews,
      setReviews,
      updateProfile,
      vendorId,
      loadPortfolioPhotos,
      loadPortfolioVideos,
      loadBlogPosts,
      loadReviews
    };

    switch (activeTab) {
      case 'overview':
        return <OverView />;
      case 'profile':
        return <ProfileTab {...sharedData} />;
      case 'media':
        return <PortFolioGallery />;
      case 'videos':
        return <VideoContent />;
      case 'blogs':
        return <BlogPost />;
      case 'reviews':
        return <Reviews />;
      default:
        return <OverView />;
    }
  };

  if (loading) {
    return (
      <>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader />
      <View style={styles.container}>
        {/* Custom Tab Bar */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            ref={tabScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarScrollContent}
          >
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => handleTabPress(tab.id, index)}
                  onLayout={(event) => {
                    const { x, width: tabWidth } = event.nativeEvent.layout;
                    tabPositions.current[tab.id] = x;
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.tabContent, { flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 5, gap: 5 }]}>
                    <FeatherIcon
                      name={tab.icon}
                      size={18}
                      color={isActive ? '#4F46E5' : '#6B7280'}
                    />
                    <Text style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive
                    ]}>
                      {tab.name}
                    </Text>
                  </View>
                  {isActive && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>
      </View>
    </>
  );
};


// ========================================
// PROFILE TAB COMPONENT
// ========================================
const ProfileTab = ({ profile, setProfile, updateProfile, vendorId }) => {
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [notification, setNotification] = useState(null);

  const formatServiceType = (serviceType) => {
    if (!serviceType) return 'Service Provider';
    return serviceType
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

  const getLocationDisplay = () => {
    const locationParts = [];
    if (profile.area) locationParts.push(profile.area);
    if (profile.city) locationParts.push(profile.city);
    return locationParts.length > 0 ? locationParts.join(', ') : 'India';
  };

  const handleShare = async () => {
    try {
      // Use the database _id from profile (this is the correct format)
      const correctId = profile._id || vendorId;
      
      if (!correctId || correctId.startsWith('VENDOR_')) {
        console.error('Invalid vendor ID format:', correctId);
        Alert.alert('Error', 'Unable to share profile. Please try again later.');
        return;
      }
      
      const vendorName = profile.businessName || 'Vendor';
      const vendorService = formatServiceType(profile.serviceType);
      const vendorLocation = getLocationDisplay();
      const vendorRating = profile.rating || 0;
      
      const shareableLink = `https://aissignatureevent.com/vendor/${correctId}`;
      
      console.log('✅ Sharing correct database ID:', correctId);
      console.log('🔗 Shareable link:', shareableLink);
      
      let shareMessage = `🌟 Check out ${vendorName} on AIS Events!\n\n`;
      shareMessage += `📌 Service: ${vendorService}\n`;
      shareMessage += `📍 Location: ${vendorLocation}\n`;
      if (vendorRating > 0) shareMessage += `⭐ Rating: ${vendorRating}/5\n\n`;
      shareMessage += `🔗 View Profile: ${shareableLink}\n\n`;
      shareMessage += `📲 Download the AIS Events app to connect with this vendor!`;
      
      await Share.share({
        message: shareMessage,
        title: `${vendorName} - AIS Events Vendor Profile`,
        url: shareableLink,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share vendor profile');
    }
  };

  const uploadImage = async (imagePath) => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const formData = new FormData();
      formData.append('image', {
        uri: imagePath,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/upload/vendor-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.url;
      }
      throw new Error(data.message || 'Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel) return null;
      if (result.error) throw new Error(result.error);
      return result.assets[0].uri;
    } catch (error) {
      console.error('Image pick error:', error);
      showNotification('error', 'Failed to pick image');
      return null;
    }
  };

  const handleCoverImageUpload = async () => {
    const imageUri = await pickImage();
    if (!imageUri) return;

    setUploadingCover(true);
    try {
      const url = await uploadImage(imageUri);
      setTempProfile(prev => ({ ...prev, coverImage: url }));
      showNotification('success', 'Cover image uploaded! Click Save to apply changes.');
    } catch (error) {
      showNotification('error', error.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfileImageUpload = async () => {
    const imageUri = await pickImage();
    if (!imageUri) return;

    setUploadingProfile(true);
    try {
      const url = await uploadImage(imageUri);
      setTempProfile(prev => ({ ...prev, profileImage: url }));
      showNotification('success', 'Profile image uploaded! Click Save to apply changes.');
    } catch (error) {
      showNotification('error', error.message || 'Failed to upload profile image');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setEditMode(true);
  };

  const handleCancel = () => {
    setTempProfile(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    // Validate phone numbers first
    const normalizePhone = (value) => {
      const cleaned = String(value || '').replace(/\D/g, '');
      return cleaned.length === 10 ? cleaned : '';
    };
    
    const MOBILE_REGEX = /^[6-9]\d{9}$/;
    
    // Validate phone number
    const phoneNumber = normalizePhone(tempProfile.contact);
    if (tempProfile.contact && tempProfile.contact.trim() !== '') {
      if (!MOBILE_REGEX.test(phoneNumber)) {
        showNotification('error', 'Please enter a valid 10-digit Indian mobile number (starts with 6-9)');
        return;
      }
    }
    
    // Validate WhatsApp number
    const whatsappNumber = normalizePhone(tempProfile.whatsapp);
    if (tempProfile.whatsapp && tempProfile.whatsapp.trim() !== '') {
      if (!MOBILE_REGEX.test(whatsappNumber)) {
        showNotification('error', 'Please enter a valid 10-digit Indian WhatsApp number (starts with 6-9)');
        return;
      }
    }
    
    setSaving(true);
    try {
      const result = await updateProfile(tempProfile);
      if (result.success) {
        setProfile(tempProfile);
        setEditMode(false);
        setTempProfile(null);
        showNotification('success', 'Profile updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTempProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTempProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const currentData = editMode ? tempProfile : profile;

  return (
    <View style={styles.tabContent}>
      {/* Notification */}
      {notification && (
        <View style={[styles.notification, notification.type === 'success' ? styles.notificationSuccess : styles.notificationError]}>
          <FeatherIcon name={notification.type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="#FFFFFF" />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}

      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {currentData.coverImage ? (
          <Image source={{ uri: currentData.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <FeatherIcon name="image" size={48} color="#9CA3AF" />
            <Text style={styles.coverPlaceholderText}>No cover image</Text>
          </View>
        )}
        {editMode && (
          <TouchableOpacity onPress={handleCoverImageUpload} disabled={uploadingCover} style={styles.editCoverButton}>
            {uploadingCover ? <ActivityIndicator size="small" color="#FFFFFF" /> : <FeatherIcon name="camera" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Image */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            {currentData.profileImage ? (
              <Image source={{ uri: currentData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <FeatherIcon name="briefcase" size={40} color="#9CA3AF" />
              </View>
            )}
          </View>
          {editMode && (
            <TouchableOpacity onPress={handleProfileImageUpload} disabled={uploadingProfile} style={styles.editProfileButton}>
              {uploadingProfile ? <ActivityIndicator size="small" color="#FFFFFF" /> : <FeatherIcon name="camera" size={14} color="#FFFFFF" />}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileInfo}>
          {editMode ? (
            <View style={styles.editFields}>
              <TextInput style={styles.inputLarge} value={tempProfile.businessName} onChangeText={(text) => handleFieldChange('businessName', text)} placeholder="Business Name" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.inputMedium} value={tempProfile.ownerName} onChangeText={(text) => handleFieldChange('ownerName', text)} placeholder="Owner Name" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.inputMedium} value={tempProfile.serviceType} onChangeText={(text) => handleFieldChange('serviceType', text)} placeholder="Service Type" placeholderTextColor="#9CA3AF" />
            </View>
          ) : (
            <>
              <Text style={styles.businessName}>{currentData.businessName || 'Your Business Name'}</Text>
              <Text style={styles.ownerName}>{currentData.ownerName}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceBadgeText}>{currentData.serviceType || 'Service Type'}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionButtons}>
          {!editMode ? (
            <>
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <FeatherIcon name="share-2" size={18} color="#4F46E5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <FeatherIcon name="edit-2" size={16} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <FeatherIcon name="x" size={16} color="#374151" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <><FeatherIcon name="save" size={16} color="#FFFFFF" /><Text style={styles.saveButtonText}>Save</Text></>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FeatherIcon name="file-text" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>About Business</Text>
        </View>
        {editMode ? (
          <TextInput style={styles.textArea} value={tempProfile.description} onChangeText={(text) => handleFieldChange('description', text)} placeholder="Describe your business..." placeholderTextColor="#9CA3AF" multiline numberOfLines={6} textAlignVertical="top" />
        ) : (
          <Text style={styles.descriptionText}>{currentData.description || 'No description added yet.'}</Text>
        )}
      </View>

      {/* Location Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FeatherIcon name="map-pin" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Location Details</Text>
        </View>
        {editMode ? (
          <View style={styles.locationFields}>
            <TextInput style={styles.input} value={tempProfile.city} onChangeText={(text) => handleFieldChange('city', text)} placeholder="City" placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} value={tempProfile.area} onChangeText={(text) => handleFieldChange('area', text)} placeholder="Area/Locality" placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} value={tempProfile.address} onChangeText={(text) => handleFieldChange('address', text)} placeholder="Full Address" placeholderTextColor="#9CA3AF" />
          </View>
        ) : (
          <View>
            <Text style={styles.locationText}><Text style={styles.locationBold}>{currentData.area}</Text>, {currentData.city}</Text>
            {currentData.address && <Text style={styles.addressText}>{currentData.address}</Text>}
          </View>
        )}
      </View>

      {/* Pricing Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcon name="currency-inr" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Price Range</Text>
        </View>
        {editMode ? (
          <View style={styles.priceFields}>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Minimum Price (₹)</Text>
              <TextInput style={styles.input} value={tempProfile.priceRange.min} onChangeText={(text) => handleFieldChange('priceRange.min', text)} placeholder="Min" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
            </View>
            <View style={styles.priceField}>
              <Text style={styles.priceLabel}>Maximum Price (₹)</Text>
              <TextInput style={styles.input} value={tempProfile.priceRange.max} onChangeText={(text) => handleFieldChange('priceRange.max', text)} placeholder="Max" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
            </View>
          </View>
        ) : (
          <View style={styles.priceDisplay}>
            <Text style={styles.priceValue}>₹{currentData.priceRange.min ? Number(currentData.priceRange.min).toLocaleString('en-IN') : '---'}</Text>
            <Text style={styles.priceSeparator}>to</Text>
            <Text style={styles.priceValue}>₹{currentData.priceRange.max ? Number(currentData.priceRange.max).toLocaleString('en-IN') : '---'}</Text>
          </View>
        )}
      </View>

      {/* Contact Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FeatherIcon name="phone" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Contact Info</Text>
        </View>
        {editMode ? (
          <View style={styles.contactFields}>
            <TextInput 
              style={styles.input} 
              value={tempProfile.contact} 
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
                handleFieldChange('contact', cleaned);
              }} 
              placeholder="Phone Number (10 digits)" 
              placeholderTextColor="#9CA3AF" 
              keyboardType="phone-pad" 
              maxLength={10}
            />
            <Text style={styles.phoneHint}>Enter 10-digit mobile number starting with 6,7,8,9</Text>
            
            <View style={styles.disabledInput}>
              <FeatherIcon name="lock" size={16} color="#9CA3AF" />
              <Text style={styles.disabledInputText}>{tempProfile.email || 'Email Address'}</Text>
            </View>
            
            <TextInput 
              style={styles.input} 
              value={tempProfile.whatsapp} 
              onChangeText={(text) => handleFieldChange('whatsapp', text)} 
              placeholder="WhatsApp Number" 
              placeholderTextColor="#9CA3AF" 
              keyboardType="phone-pad" 
            />
            
            <TextInput 
              style={styles.input} 
              value={tempProfile.website} 
              onChangeText={(text) => handleFieldChange('website', text)} 
              placeholder="Website URL" 
              placeholderTextColor="#9CA3AF" 
            />
          </View>
        ) : (
          <View style={styles.contactDisplay}>
            <TouchableOpacity style={styles.contactItem}>
              <FeatherIcon name="phone" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{currentData.contact || 'Not provided'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <FeatherIcon name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{currentData.email || 'Not provided'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Social Media Links */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FeatherIcon name="instagram" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Social Media</Text>
        </View>
        {editMode ? (
          <View style={styles.socialFields}>
            <TextInput style={styles.input} value={tempProfile.instagram} onChangeText={(text) => handleFieldChange('instagram', text)} placeholder="@username" placeholderTextColor="#9CA3AF" />
            <TextInput style={styles.input} value={tempProfile.facebook} onChangeText={(text) => handleFieldChange('facebook', text)} placeholder="facebook.com/yourpage" placeholderTextColor="#9CA3AF" />
          </View>
        ) : (
          <View style={styles.socialDisplay}>
            {currentData.instagram ? (
              <TouchableOpacity style={styles.instagramButton}>
                <FeatherIcon name="instagram" size={20} color="#FFFFFF" />
                <Text style={styles.socialButtonText}>@{currentData.instagram.replace('@', '')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noSocialText}>No Instagram linked</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoBanner}>
        <View style={styles.infoIcon}>
          <FeatherIcon name="alert-circle" size={20} color="#3B82F6" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>💡 All Changes Reflect in Search Results</Text>
          <Text style={styles.infoText}>Every detail you edit here will automatically update in search results.</Text>
        </View>
      </View>
    </View>
  );
};

// ========================================
// MEDIA TAB COMPONENT
// ========================================
const MediaTab = ({ portfolioPhotos, setPortfolioPhotos, currentPlan }) => {
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const getImageLimit = (plan) => {
    switch (plan) {
      case 'starter': return 15;
      case 'growth': return 30;
      case 'premium': return Infinity;
      default: return 3;
    }
  };

  const uploadImage = async (imagePath) => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const formData = new FormData();
      formData.append('image', {
        uri: imagePath,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/upload/vendor-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.success) return data.url;
      throw new Error(data.message || 'Upload failed');
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (result.didCancel) return;
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }

    const imageUri = result.assets[0].uri;
    setUploading(true);

    try {
      const url = await uploadImage(imageUri);
      const token = await AsyncStorage.getItem('vendorToken');

      const response = await fetch(`${API_BASE_URL}/vendor-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, type: 'image', caption: '' })
      });

      const data = await response.json();
      if (data.success) {
        setPortfolioPhotos(prev => [...prev, data.data]);
        Alert.alert('Success', 'Photo uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('vendorToken');
            const response = await fetch(`${API_BASE_URL}/vendor-media/${photoId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
              setPortfolioPhotos(prev => prev.filter(photo => photo._id !== photoId));
              Alert.alert('Success', 'Photo deleted successfully!');
            }
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.mediaHeader}>
        <View>
          <Text style={styles.mediaTitle}>Portfolio Gallery</Text>
          <Text style={styles.mediaSubtitle}>
            {portfolioPhotos.length} / {getImageLimit(currentPlan) === Infinity ? '∞' : getImageLimit(currentPlan)} photos used
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FeatherIcon name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {portfolioPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <FeatherIcon name="image" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No photos yet</Text>
          <Text style={styles.emptyStateText}>Upload your first portfolio photo to showcase your work</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleUpload}>
            <Text style={styles.emptyStateButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mediaGrid}>
          {portfolioPhotos.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.mediaItem}
              onLongPress={() => handleDelete(item._id)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.url }} style={styles.mediaImage} />
              <TouchableOpacity
                style={styles.deleteMediaButton}
                onPress={() => handleDelete(item._id)}
              >
                <FeatherIcon name="x" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ========================================
// BLOG TAB COMPONENT
// ========================================
const BlogTab = ({ blogPosts }) => {
  const navigation = useNavigation();

  const handleCreateBlog = () => {
    navigation.navigate('BlogManagement');
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.mediaHeader}>
        <View>
          <Text style={styles.mediaTitle}>Blog Posts</Text>
          <Text style={styles.mediaSubtitle}>{blogPosts.length} posts published</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={handleCreateBlog}>
          <FeatherIcon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {blogPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <FeatherIcon name="file-text" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No blog posts yet</Text>
          <Text style={styles.emptyStateText}>Create your first blog post to share your expertise</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateBlog}>
            <Text style={styles.emptyStateButtonText}>Create Blog Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        blogPosts.map((post) => (
          <TouchableOpacity key={post._id} style={styles.blogCard}>
            {post.coverImage && (
              <Image source={{ uri: post.coverImage }} style={styles.blogImage} />
            )}
            <View style={styles.blogContent}>
              <Text style={styles.blogTitle}>{post.title}</Text>
              <Text style={styles.blogExcerpt} numberOfLines={2}>{post.excerpt || post.content?.substring(0, 100)}</Text>
              <Text style={styles.blogDate}>{new Date(post.createdAt).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

// ========================================
// REVIEW TAB COMPONENT
// ========================================
const ReviewTab = ({ reviews }) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.mediaHeader}>
        <View>
          <Text style={styles.mediaTitle}>Customer Reviews</Text>
          <Text style={styles.mediaSubtitle}>{reviews.length} reviews received</Text>
        </View>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <FeatherIcon name="star" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No reviews yet</Text>
          <Text style={styles.emptyStateText}>When customers review your services, they'll appear here</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewUser}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <View>
                  <Text style={styles.reviewUserName}>{review.user?.name || 'Anonymous'}</Text>
                  <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FeatherIcon
                    key={star}
                    name={star <= review.rating ? 'star' : 'star'}
                    size={16}
                    color={star <= review.rating ? '#F59E0B' : '#D1D5DB'}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            {review.reply && (
              <View style={styles.reviewReply}>
                <Text style={styles.replyLabel}>Your Reply:</Text>
                <Text style={styles.replyText}>{review.reply}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
};

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  phoneHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  // Tab Bar Styles
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabBarScrollContent: {
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  tabItemActive: {
    // Active state styling
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Overview Tab Styles
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewProfileImage: {
    marginRight: 16,
  },
  overviewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
  },
  overviewAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewInfo: {
    flex: 1,
  },
  overviewBusinessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  overviewServiceType: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  overviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overviewRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  overviewReviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  planCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  planDescription: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 18,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Media Tab Styles
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  mediaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaItem: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  deleteMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Video Tab Styles
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  videoThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  videoDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  // Blog Tab Styles
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  blogImage: {
    width: '100%',
    height: 150,
  },
  blogContent: {
    padding: 12,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  blogExcerpt: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  blogDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  // Review Tab Styles
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewReply: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 13,
    color: '#374151',
  },
  // Profile Tab Specific Styles
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  notification: {
    position: 'absolute',
    top: 16,
    right: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationSuccess: {
    backgroundColor: '#10B981',
  },
  notificationError: {
    backgroundColor: '#EF4444',
  },
  notificationText: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  coverContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 80,
    backgroundColor: '#F3F4F6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  coverPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
  editCoverButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: -60,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  editFields: {
    width: '100%',
    gap: 12,
  },
  inputLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    color: '#111827',
  },
  inputMedium: {
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    color: '#111827',
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  serviceBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  serviceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  locationFields: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
  },
  locationBold: {
    fontWeight: '600',
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  priceFields: {
    flexDirection: 'row',
    gap: 12,
  },
  priceField: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  contactFields: {
    gap: 12,
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  disabledInputText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  contactDisplay: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  socialFields: {
    gap: 12,
  },
  socialDisplay: {
    gap: 12,
  },
  instagramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E4405F',
    paddingVertical: 12,
    borderRadius: 12,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noSocialText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsFields: {
    gap: 12,
  },
  statsFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
});

export default VendorProfileDashboard;