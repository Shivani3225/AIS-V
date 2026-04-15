
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Linking,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import PortFolioGallery from './PortFolioGallery';
import BlogPost from './BlogPost';
import VideoContent from './VideoContent';

const { width: screenWidth } = Dimensions.get('window');
const API_BASE_URL = 'https://api.aissignatureevent.com/api';

const OverView = () => {
  const [showComponent, setShowComponent] = useState(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState({
    photos: 0,
    videos: 0,
    blogs: 0,
    reviews: 0
  });
  const [profile, setProfile] = useState({
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
    totalReviews: 0,
    _id: ''
  });
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [portfolioVideos, setPortfolioVideos] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [limits, setLimits] = useState(null);
  const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0, videoCount: 0 });

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/vendor-profile/dashboard/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📊 Dashboard Data:', data);

      if (data.success) {
        if (data.data.videos && Array.isArray(data.data.videos)) {
          console.log('🎬 Videos found in dashboard:', data.data.videos.length);
          setPortfolioVideos(data.data.videos);
          setSnapshot(prev => ({ ...prev, videos: data.data.videos.length }));
        } else {
          console.log('🎬 No videos in dashboard data');
          setPortfolioVideos([]);
        }
        
        if (data.data.media && Array.isArray(data.data.media)) {
          const images = data.data.media.filter(item => item.type === 'image');
          console.log('📸 Images found in dashboard:', images.length);
          setPortfolioPhotos(images);
          setSnapshot(prev => ({ ...prev, photos: images.length }));
        }
        
        if (data.data.limits && setLimits) {
          setLimits(data.data.limits);
        }
        if (data.data.currentUsage && setCurrentUsage) {
          setCurrentUsage(data.data.currentUsage);
        }
        if (data.data.planKey) {
          setCurrentPlan(data.data.planKey);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfile(),
        loadDashboardData(),
        loadBlogPosts(),
        loadReviews()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileStrength = () => {
    let totalWeight = 0;
    let earnedWeight = 0;

    const basicInfoCompleted = !!(profile.businessName && profile.serviceType && profile.city);
    if (basicInfoCompleted) earnedWeight += 20;
    totalWeight += 20;

    const contactCompleted = !!(profile.contact && profile.email);
    if (contactCompleted) earnedWeight += 15;
    totalWeight += 15;

    const descriptionCompleted = !!(profile.description && profile.description.length >= 50);
    if (descriptionCompleted) earnedWeight += 10;
    totalWeight += 10;

    const pricingCompleted = !!(profile.priceRange.min && profile.priceRange.max);
    if (pricingCompleted) earnedWeight += 10;
    totalWeight += 10;

    let mediaScore = 0;
    if (portfolioPhotos.length >= 3) {
      mediaScore = 25;
    } else if (portfolioPhotos.length === 2) {
      mediaScore = 18;
    } else if (portfolioPhotos.length === 1) {
      mediaScore = 17;
    }
    earnedWeight += mediaScore;
    totalWeight += 25;

    const blogCompleted = blogPosts.length >= 1;
    if (blogCompleted) earnedWeight += 10;
    totalWeight += 10;

    const videoCompleted = portfolioVideos.length >= 1;
    if (videoCompleted) earnedWeight += 10;
    totalWeight += 10;

    const percentage = Math.min(Math.round((earnedWeight / totalWeight) * 100), 100);
    return percentage;
  };

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

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
          totalReviews: vendor.totalReviews || 0,
          _id: vendor._id || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
        setSnapshot(prev => ({ ...prev, blogs: data.data.length }));
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
        setSnapshot(prev => ({ ...prev, reviews: data.data.length }));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const percentage = calculateProfileStrength();
  const profileUrl = `https://events.aissignatureevent.com/vendor/${profile._id || 'your-business'}`;

  const getColor = () => {
    if (percentage < 50) return '#ef4444';
    if (percentage < 80) return '#f59e0b';
    return '#22c55e';
  };

  const progressColor = getColor();

  const checklistData = [
    {
      title: "Complete Business Information",
      subtitle: "Business name, service type, city",
      completed: !!(profile.businessName && profile.serviceType && profile.city),
      weight: 20
    },
    {
      title: "Add Contact Details",
      subtitle: "Phone number and email",
      completed: !!(profile.contact && profile.email),
      weight: 15
    },
    {
      title: "Write Business Description (50+ words)",
      subtitle: "Tell customers about your services",
      completed: !!(profile.description && profile.description.length >= 50),
      weight: 10
    },
    {
      title: "Set Pricing Information",
      subtitle: "Add minimum and maximum price range",
      completed: !!(profile.priceRange.min && profile.priceRange.max),
      weight: 10
    },
    {
      title: "Upload 3+ Portfolio Images",
      subtitle: "Showcase your best work",
      completed: portfolioPhotos.length >= 3,
      weight: 25
    },
    {
      title: "Publish Your First Blog Post",
      subtitle: "Share your expertise",
      completed: blogPosts.length >= 1,
      weight: 10
    },
    {
      title: "Add Video Content",
      subtitle: "Engage customers with video",
      completed: portfolioVideos.length >= 1,
      weight: 10
    },
  ];

  const shareWhatsApp = () => {
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(profileUrl)}`);
  };

  const shareFacebook = () => {
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`);
  };

  const shareTwitter = () => {
    Linking.openURL(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`);
  };

  const shareLinkedin = () => {
    Linking.openURL(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`);
  };

  const copyToClipboard = () => {
    Alert.alert('Link Copied', 'Profile link copied to clipboard!');
  };

  const quickActions = [
    {
      title: 'Upload Portfolio Images',
      description: 'Showcase your best work with high-quality images',
      icon: 'image-outline',
      color: '#FF8A00',
      bgColor: '#FFF4E5',
      onPress: () => setShowComponent('portfolio')
    },
    {
      title: 'Create Blog Post',
      description: 'Share your expertise and improve SEO',
      icon: 'create-outline',
      color: '#4CAF50',
      bgColor: '#E6F6E6',
      onPress: () => setShowComponent('blogs')
    },
    {
      title: 'Upload Video Content',
      description: 'Engage customers with video showcases',
      icon: 'videocam-outline',
      color: '#FF4D4D',
      bgColor: '#FFE6E6',
      onPress: () => setShowComponent('videos')
    }
  ];

  
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
      <View style={styles.container}>
        {/* Profile Completion Meter */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Profile Strength</Text>
            <Text style={[styles.completionPercent, { color: progressColor }]}>
              {percentage}%
            </Text>
          </View>
          <Text style={styles.completionSubtitle}>
            Complete your profile to increase visibility
          </Text>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: progressColor }]} />
          </View>

          <View style={[styles.statusContainer, { backgroundColor: progressColor }]}>
            <View style={styles.statusIconCircle}>
              <Icon name="trophy-outline" size={24} color={progressColor} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good Progress!' : 'Let\'s Get Started!'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {percentage >= 80 ? 'Your profile is nearly complete' :
                  percentage >= 50 ? 'Keep going to reach 80%' :
                    'Complete your profile to attract more customers'}
              </Text>
            </View>
          </View>
        </View>

        {/* Completion Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>Completion Checklist</Text>
          {checklistData.map((item, index) => (
            <View key={index} style={[styles.checklistItem]}>
              <View style={styles.checklistLeft}>
                <View>
                  <Text style={[styles.checklistItemTitle]}>
                    {item.title}
                  </Text>
                  <Text style={styles.checklistItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Content Snapshot - Stats Cards */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Text style={styles.snapshotTitle}>Content Snapshot</Text>
            <TouchableOpacity onPress={loadAllData} style={styles.refreshButton}>
              <Icon name="refresh-outline" size={16} color="#6B7280" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#F3E8FF' }]}>
                  <Icon name="images-outline" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{snapshot.photos}</Text>
                <Text style={styles.statLabel}>Photos</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFE4E4' }]}>
                  <Icon name="videocam-outline" size={24} color="#EF4444" />
                </View>
                <Text style={styles.statValue}>{snapshot.videos}</Text>
                <Text style={styles.statLabel}>Videos</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E0F2E9' }]}>
                  <Icon name="document-text-outline" size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{snapshot.blogs}</Text>
                <Text style={styles.statLabel}>Blogs</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="star-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{snapshot.reviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionItem, { backgroundColor: action.bgColor }]}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Icon name={action.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Share Profile Button */}
        <TouchableOpacity style={styles.shareButton} onPress={() => setModalVisible(true)}>
          <Icon name="share-social-outline" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Your Profile</Text>
        </TouchableOpacity>

        {/* SHARE MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Share Your Profile</Text>
                  <Text style={styles.modalSubtitle}>Let others discover your services</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Profile Link</Text>
              <View style={styles.linkBox}>
                <TextInput
                  value={profileUrl}
                  editable={false}
                  style={styles.linkInput}
                />
                <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Share via Social Media</Text>
              <View style={styles.socialRow}>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#25D366' }]} onPress={shareWhatsApp}>
                  <Icon name="logo-whatsapp" size={20} color="#FFFFFF" />
                  <Text style={styles.socialText}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]} onPress={shareFacebook}>
                  <Icon name="logo-facebook" size={20} color="#FFFFFF" />
                  <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#000000' }]} onPress={shareTwitter}>
                  <Icon name="logo-twitter" size={20} color="#FFFFFF" />
                  <Text style={styles.socialText}>Twitter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#0A66C2' }]} onPress={shareLinkedin}>
                  <Icon name="logo-linkedin" size={20} color="#FFFFFF" />
                  <Text style={styles.socialText}>LinkedIn</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipBox}>
                <Icon name="bulb-outline" size={16} color="#4F46E5" />
                <Text style={styles.tipText}>
                  Tip: Share your profile on social media to reach more customers and grow your business!
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
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
  // Profile Completion Card
  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  completionPercent: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  completionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  // Snapshot Card
  snapshotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  snapshotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Checklist Card
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checklistItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  checklistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checklistCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checklistItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  checklistItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  checklistItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checklistBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checklistBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Quick Actions Card
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 13,
    color: '#6B7280',
  },
  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  linkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  copyBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#4F46E5',
  },
});

export default OverView;