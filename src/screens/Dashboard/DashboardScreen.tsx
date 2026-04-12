import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import CustomHeader from '../../components/header/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [pressed, setPressed] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for inquiry stats
  const [inquiryStats, setInquiryStats] = useState({
    total: 0,
    pending: 0,
    responded: 0,
    closed: 0,
    cancelled: 0
  });

  const [subscriptionData, setSubscriptionData] = useState({
    planName: "Free",
    amountPaid: "₹0",
    startDate: "Not started",
    expiryDate: "Not started",
    daysRemaining: 0,
    autoRenewal: false,
    status: 'free',
    isActive: false,
    isExpired: false,
    isFree: true,
    hasUpcomingPlan: false,
    planKey: 'free'
  });

  const [vendorData, setVendorData] = useState({
    businessName: "",
    contactName: "",
    vendorId: "",
    email: ""
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load Dashboard Data (Combined API calls)
  const loadDashboardData = async () => {
    console.log('========== LOAD DASHBOARD DATA START ==========');
    console.log('1. Starting dashboard data load...');

    setLoading(true);
    try {
      // Get stored credentials
      const token = await AsyncStorage.getItem('vendorToken');
      const vendorId = await AsyncStorage.getItem('vendorId');

      console.log('2. Retrieved from AsyncStorage:');
      console.log('   - Token exists:', !!token);
      console.log('   - Token length:', token ? token.length : 0);
      console.log('   - VendorId:', vendorId);

      if (!token || !vendorId) {
        console.error('❌ Authentication missing - Token:', !!token, 'VendorId:', !!vendorId);
        Alert.alert('Error', 'Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      console.log('3. Making API calls to:');
      console.log('   - Inquiries URL:', `${API_BASE_URL}/vendors/dashboard/inquiries?limit=100`);
      console.log('   - Profile URL:', `${API_BASE_URL}/vendor-profile/profile/me`);

      // Make both API calls in parallel
      const [inquiriesRes, vendorProfileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vendors/dashboard/inquiries?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/vendor-profile/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('4. API Responses:');
      console.log('   - Inquiries Response Status:', inquiriesRes.status, inquiriesRes.statusText);
      console.log('   - Profile Response Status:', vendorProfileRes.status, vendorProfileRes.statusText);

      // Process inquiries data
      console.log('5. Processing Inquiries Data...');
      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        console.log('   - Inquiries Response Data:', JSON.stringify(inquiriesData, null, 2));

        if (inquiriesData.success) {
          // Handle different response formats
          const allInquiries = Array.isArray(inquiriesData.data)
            ? inquiriesData.data
            : (inquiriesData.data?.inquiries || []);

          console.log('   - Total inquiries fetched:', allInquiries.length);

          // Filter only approved inquiries
          const approvedInquiries = allInquiries.filter(i => i.approvalStatus === 'approved');
          console.log('   - Approved inquiries count:', approvedInquiries.length);

          // Calculate statistics
          const stats = {
            total: approvedInquiries.length,
            pending: approvedInquiries.filter(i => i.status === 'pending' || i.status === 'sent').length,
            responded: approvedInquiries.filter(i => i.status === 'responded').length,
            closed: approvedInquiries.filter(i => i.status === 'closed' || i.status === 'completed').length,
            cancelled: approvedInquiries.filter(i => i.status === 'cancelled').length
          };

          console.log('   - Calculated Stats:', stats);

          setInquiryStats(stats);
          console.log('✅ Inquiry stats updated successfully');
        } else {
          console.warn('⚠️ Inquiries API returned success=false:', inquiriesData);
        }
      } else {
        const errorText = await inquiriesRes.text();
        console.error('❌ Failed to fetch inquiries - Status:', inquiriesRes.status);
        console.error('   Error response:', errorText);
      }

      // Process vendor profile data
      console.log('6. Processing Vendor Profile Data...');
      if (vendorProfileRes.ok) {
        const vendorDataRes = await vendorProfileRes.json();
        console.log('   - Profile Response Data:', JSON.stringify(vendorDataRes, null, 2));

        if (vendorDataRes.success && vendorDataRes.data) {
          const vendor = vendorDataRes.data;

          const vendorInfo = {
            businessName: vendor.businessName || vendor.business_name || vendor.name || "Vendor",
            contactName: vendor.contactName || vendor.contact_name || vendor.name || "",
            vendorId: vendor._id || vendor.id || "",
            email: vendor.email || ""
          };

          console.log('   - Processed vendor info:', vendorInfo);

          setVendorData(vendorInfo);
          console.log('✅ Vendor profile data updated successfully');

          // Also fetch subscription data from vendor details if available
          const vendorIdToFetch = vendor._id || vendor.id;
          if (vendorIdToFetch) {
            console.log('7. Fetching subscription data for vendorId:', vendorIdToFetch);
            await fetchVendorSubscription(vendorIdToFetch);
          } else {
            console.warn('⚠️ No vendor ID available for subscription fetch');
          }
        } else {
          console.warn('⚠️ Profile API returned success=false or no data:', vendorDataRes);
        }
      } else {
        const errorText = await vendorProfileRes.text();
        console.error('❌ Failed to fetch vendor profile - Status:', vendorProfileRes.status);
        console.error('   Error response:', errorText);
      }

      console.log('========== LOAD DASHBOARD DATA COMPLETE ==========');

    } catch (error) {
      console.error('========== ERROR IN LOAD DASHBOARD DATA ==========');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      Alert.alert('Error', 'Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('Loading state reset to false');
    }
  };

  // Fetch Vendor Subscription from Vendor Details
  // Fetch Vendor Subscription from Vendor Details
  const fetchVendorSubscription = async (vendorId) => {
    console.log('========== FETCH VENDOR SUBSCRIPTION START ==========');
    console.log('1. VendorId to fetch:', vendorId);

    try {
      const token = await AsyncStorage.getItem('vendorToken');
      console.log('2. Token exists:', !!token);

      if (!token || !vendorId) {
        console.warn('⚠️ Missing required data - Token:', !!token, 'VendorId:', !!vendorId);
        return;
      }

      // Try multiple endpoints to get subscription data
      const endpoints = [
        `${API_BASE_URL}/vendors/${vendorId}`,           // Primary endpoint
        `${API_BASE_URL}/vendor-profile/profile/me`,     // Alternative: get from profile
        `${API_BASE_URL}/vendors/${vendorId}/subscription` // Try subscription-specific endpoint
      ];

      let subscriptionDataFound = false;
      let vendorData = null;

      // Try each endpoint until we find subscription data
      for (const endpoint of endpoints) {
        if (subscriptionDataFound) break;

        console.log(`3. Trying endpoint: ${endpoint}`);

        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`   Response Status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`   Response Data:`, JSON.stringify(data, null, 2));

            if (data.success && data.data) {
              vendorData = data.data;

              // Check if we have subscription data
              if (vendorData.subscription) {
                subscriptionDataFound = true;
                console.log('✅ Found subscription data in endpoint:', endpoint);
                break;
              } else if (endpoint === endpoints[1]) {
                // If this is the profile endpoint, we already have vendor info
                console.log('Using profile data without subscription info');
                subscriptionDataFound = true;
                break;
              }
            }
          } else {
            const errorText = await response.text();
            console.log(`   Error response: ${errorText}`);
          }
        } catch (error) {
          console.log(`   Error calling ${endpoint}:`, error.message);
        }
      }

      if (vendorData) {
        // Extract subscription data from vendor data
        const sub = vendorData.subscription || {};

        console.log('7. Extracted Subscription Data:');
        console.log('   - Raw subscription object:', JSON.stringify(sub, null, 2));
        console.log('   - planKey:', sub.planKey);
        console.log('   - planName:', sub.planName);
        console.log('   - status:', sub.status);

        const formatDate = (date) => {
          if (!date) return 'Not started';
          try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Invalid date';
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          } catch (e) {
            console.error(`Error formatting date: ${date}`, e);
            return 'Invalid date';
          }
        };

        const getAmountPaid = (planKey, status) => {
          let amount = '₹0';
          if (status === 'free' || planKey === 'free') {
            amount = '₹0';
          } else if (planKey === 'starter') {
            amount = '₹499';
          } else if (planKey === 'growth') {
            amount = '₹999';
          } else if (planKey === 'premium') {
            amount = '₹1499';
          }
          return amount;
        };

        const getPlanName = (planKey, planName) => {
          let name = '';
          if (planName) {
            name = planName;
          } else if (planKey === 'free') {
            name = 'Free';
          } else if (planKey === 'starter') {
            name = 'Starter';
          } else if (planKey === 'growth') {
            name = 'Growth';
          } else if (planKey === 'premium') {
            name = 'Premium';
          } else {
            name = planKey || 'Free';
          }
          return name;
        };

        // Calculate days remaining
        let daysRemaining = 0;
        if (sub.expiryDate) {
          const now = new Date();
          const expiry = new Date(sub.expiryDate);
          daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
          console.log('8. Days remaining calculation:', daysRemaining);
        }

        const subscriptionInfo = {
          planName: getPlanName(sub.planKey, sub.planName),
          amountPaid: getAmountPaid(sub.planKey, sub.status),
          startDate: formatDate(sub.startDate),
          expiryDate: formatDate(sub.expiryDate),
          daysRemaining: daysRemaining,
          autoRenewal: sub.autoRenewal || false,
          status: sub.status || 'free',
          isActive: sub.status === 'active',
          isExpired: sub.status === 'expired',
          isFree: sub.status === 'free' || sub.planKey === 'free',
          hasUpcomingPlan: !!sub.upcomingPlan,
          upcomingPlan: sub.upcomingPlan,
          planKey: sub.planKey || 'free'
        };

        console.log('9. Final Subscription Data:', subscriptionInfo);

        setSubscriptionData(subscriptionInfo);
        console.log('✅ Subscription data updated successfully');
      } else {
        console.warn('⚠️ No vendor data found from any endpoint');
        // Keep default subscription data
      }

      console.log('========== FETCH VENDOR SUBSCRIPTION END ==========');

    } catch (error) {
      console.error('========== ERROR IN FETCH VENDOR SUBSCRIPTION ==========');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Keep default subscription data
      console.log('Keeping default subscription data');
    }
  };
  // Debug function to verify subscription data
  const debugSubscriptionData = async () => {
    console.log('========== SUBSCRIPTION DATA DEBUG ==========');
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const vendorId = await AsyncStorage.getItem('vendorId');
      const vendorData = await AsyncStorage.getItem('vendorData');

      console.log('Token exists:', !!token);
      console.log('VendorId:', vendorId);
      console.log('VendorData exists:', !!vendorData);

      if (vendorData) {
        const parsedData = JSON.parse(vendorData);
        console.log('VendorData subscription:', parsedData?.subscription);
      }

      console.log('Current subscriptionData state:', subscriptionData);
      console.log('============================================');
    } catch (error) {
      console.error('Error debugging subscription data:', error);
    }
  };

  // Call debug after subscription data updates
  useEffect(() => {
    if (!loading && subscriptionData) {
      debugSubscriptionData();
    }
  }, [loading, subscriptionData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Verify stored data function
  const verifyStoredData = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const vendorId = await AsyncStorage.getItem('vendorId');
      const user = await AsyncStorage.getItem('user');

      console.log('========== VERIFY STORED DATA ==========');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('VendorId:', vendorId);
      console.log('User exists:', !!user);
      if (user) {
        console.log('User data:', JSON.parse(user));
      }
      console.log('======================================');

      return { token, vendorId };
    } catch (error) {
      console.error('Error verifying stored data:', error);
      return null;
    }
  };

  // Call verification in useEffect
  useEffect(() => {
    verifyStoredData();
    loadDashboardData();
  }, []);

  const actions = [
    {
      id: 1,
      title: "View Inquiries",
      subtitle: `Total: ${inquiryStats.total} inquiries`,
      icon: "mail",
      color: "#4A6CF7",
      bg: "#E8EDFF",
      onPress: () => {
        navigation.navigate('Inquiries');
      }
    },
    {
      id: 2,
      title: "Refresh Data",
      subtitle: "Get latest updates",
      icon: "refresh-cw",
      color: "#1F9D55",
      bg: "#E6F7EE",
      onPress: () => {
        onRefresh();
      }
    },
    {
      id: 3,
      title: "My Plans",
      subtitle: "Manage my plans",
      icon: "award",
      color: "#9B51E0",
      bg: "#F3E9FF",
      onPress: () => {
        navigation.navigate('MyPlan');
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#28C76F';
      case 'expired':
        return '#FF7A18';
      case 'free':
        return '#4A6CF7';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'free':
        return 'Free plan — upgrade from your dashboard';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  if (loading && !refreshing) {
    return (
      <>
        <CustomHeader />
        <View style={styles.loadingFullContainer}>
          <ActivityIndicator size="large" color="#4A6CF7" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2F6FED"]} />
        }
      >
        {/* Welcome Card */}
        <LinearGradient
          colors={["#2F6FED", "#8E2DE2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <View>
            <Text style={styles.title}>Welcome Back! 👋</Text>
            <Text style={styles.business}>{vendorData.businessName || "Vendor"}</Text>
            <Text style={styles.subtitle}>
              Manage your inquiries and grow your business
            </Text>
          </View>
          <Icon name="briefcase" size={40} color="rgba(255,255,255,0.4)" />
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={["#3A7BFF", "#2A56C6"]} style={styles.statsCard}>
            <Icon name="mail" size={24} color="#fff" />
            <Text style={styles.statsNumber}>{inquiryStats.total}</Text>
            <Text style={styles.statsTitle}>Total Inquiries</Text>
            <Text style={styles.statsSub}>All approved inquiries</Text>
          </LinearGradient>

          <LinearGradient colors={["#FF7A18", "#E52E71"]} style={styles.statsCard}>
            <Icon name="bell" size={24} color="#fff" />
            <Text style={styles.statsNumber}>{inquiryStats.pending}</Text>
            <Text style={styles.statsTitle}>New Inquiries</Text>
            <Text style={styles.statsSub}>Awaiting response</Text>
          </LinearGradient>

          <LinearGradient colors={["#28C76F", "#0F9D58"]} style={styles.statsCard}>
            <Icon name="message-circle" size={24} color="#fff" />
            <Text style={styles.statsNumber}>{inquiryStats.responded}</Text>
            <Text style={styles.statsTitle}>Responded</Text>
            <Text style={styles.statsSub}>Responses sent</Text>
          </LinearGradient>

          <LinearGradient colors={["#A66CFF", "#6A11CB"]} style={styles.statsCard}>
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.statsNumber}>{inquiryStats.closed}</Text>
            <Text style={styles.statsTitle}>Closed</Text>
            <Text style={styles.statsSub}>Completed deals</Text>
          </LinearGradient>
        </View>

        {/* Subscription Status Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={[styles.subscriptionIconContainer, { backgroundColor: `${getStatusColor(subscriptionData.status)}15` }]}>
              <Icon name="award" size={22} color={getStatusColor(subscriptionData.status)} />
            </View>
            <View style={styles.subscriptionTitleContainer}>
              <Text style={styles.subscriptionTitle}>Subscription Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(subscriptionData.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(subscriptionData.status) }]}>
                  {subscriptionData.status?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.subscriptionDetails}>
            {/* Plan Name - Always Show */}
            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionLabelContainer}>
                <Icon name="tag" size={16} color="#666" />
                <Text style={styles.subscriptionLabel}>Plan</Text>
              </View>
              <Text style={[styles.subscriptionValue, { fontWeight: '700', color: '#2F6FED' }]}>
                {subscriptionData.planName}
              </Text>
            </View>

            {/* Show ALL details only for ACTIVE/PAID plans */}
            {(subscriptionData.isActive || subscriptionData.isExpired) && (
              <>
                {/* Amount Paid */}
                <View style={styles.subscriptionRow}>
                  <View style={styles.subscriptionLabelContainer}>
                    <Icon name="credit-card" size={16} color="#666" />
                    <Text style={styles.subscriptionLabel}>Amount Paid</Text>
                  </View>
                  <Text style={styles.subscriptionValue}>
                    {subscriptionData.amountPaid}
                  </Text>
                </View>

                {/* Start Date */}
                <View style={styles.subscriptionRow}>
                  <View style={styles.subscriptionLabelContainer}>
                    <Icon name="calendar" size={16} color="#666" />
                    <Text style={styles.subscriptionLabel}>Start Date</Text>
                  </View>
                  <Text style={styles.subscriptionValue}>
                    {subscriptionData.startDate}
                  </Text>
                </View>

                {/* Expiry Date */}
                <View style={styles.subscriptionRow}>
                  <View style={styles.subscriptionLabelContainer}>
                    <Icon name="clock" size={16} color="#666" />
                    <Text style={styles.subscriptionLabel}>Expiry Date</Text>
                  </View>
                  <Text style={[styles.subscriptionValue, subscriptionData.isExpired && styles.expiredText]}>
                    {subscriptionData.expiryDate}
                  </Text>
                </View>

                {/* Days Remaining - Only show for active plans with days remaining */}
                {subscriptionData.isActive && subscriptionData.daysRemaining > 0 && (
                  <View style={styles.subscriptionRow}>
                    <View style={styles.subscriptionLabelContainer}>
                      <Icon name="hourglass" size={16} color="#666" />
                      <Text style={styles.subscriptionLabel}>Days Remaining</Text>
                    </View>
                    <View style={styles.daysRemainingContainer}>
                      <Text style={styles.daysRemainingNumber}>{subscriptionData.daysRemaining}</Text>
                      <Text style={styles.daysRemainingText}> days</Text>
                    </View>
                  </View>
                )}

                {/* Auto Renewal Status - Only show for active plans */}
                {subscriptionData.isActive && !subscriptionData.isFree && (
                  <View style={styles.subscriptionRow}>
                    <View style={styles.subscriptionLabelContainer}>
                      <Icon name="refresh-cw" size={16} color="#666" />
                      <Text style={styles.subscriptionLabel}>Auto Renewal</Text>
                    </View>
                    <View style={styles.autoRenewalBadge}>
                      <Icon
                        name={subscriptionData.autoRenewal ? "check-circle" : "x-circle"}
                        size={16}
                        color={subscriptionData.autoRenewal ? "#28C76F" : "#FF7A18"}
                      />
                      <Text style={[
                        styles.autoRenewalText,
                        subscriptionData.autoRenewal ? styles.autoRenewalActive : styles.autoRenewalInactive
                      ]}>
                        {subscriptionData.autoRenewal ? "Enabled" : "Disabled"}
                      </Text>
                    </View>
                  </View>
                )}

                {/* For expired plans, show a message */}
                {subscriptionData.isExpired && (
                  <View style={styles.subscriptionRow}>
                    <View style={styles.subscriptionLabelContainer}>
                      <Icon name="alert-triangle" size={16} color="#FF7A18" />
                      <Text style={styles.subscriptionLabel}>Status</Text>
                    </View>
                    <Text style={[styles.subscriptionValue, styles.expiredText]}>
                      Plan expired on {subscriptionData.expiryDate}
                    </Text>
                  </View>
                )}
              </>
            )}



            {/* Upcoming Plan (if any) - Show for all plans EXCEPT FREE */}
            {!subscriptionData.isFree && subscriptionData.hasUpcomingPlan && subscriptionData.upcomingPlan && (
              <View style={styles.upcomingPlanContainer}>
                <View style={styles.upcomingPlanHeader}>
                  <Icon name="arrow-right-circle" size={14} color="#FF7A18" />
                  <Text style={styles.upcomingPlanTitle}>Upcoming Plan</Text>
                </View>
                <Text style={styles.upcomingPlanName}>
                  {subscriptionData.upcomingPlan.planName || subscriptionData.upcomingPlan.planKey}
                </Text>
                {subscriptionData.upcomingPlan.effectiveDate && (
                  <Text style={styles.upcomingPlanDate}>
                    Effective from: {new Date(subscriptionData.upcomingPlan.effectiveDate).toLocaleDateString('en-IN')}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions Header */}
        <View style={styles.quickHeader}>
          <Icon name="trending-up" size={22} color="#2929e6" />
          <Text style={styles.Quickheading}> Quick Actions</Text>
        </View>

        {/* Quick Actions Cards */}
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPressIn={() => setPressed(item.id)}
            onPressOut={() => setPressed(null)}
            onPress={item.onPress}
            style={[
              styles.quickcard,
              { backgroundColor: pressed === item.id ? "#d6d6d6" : item.bg }
            ]}
          >
            <View style={[styles.quickiconBox, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={20} color="#fff" />
            </View>
            <View style={styles.textSection}>
              <Text style={styles.quicktitle}>{item.title}</Text>
              <Text style={styles.quicksubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 AIS Signature Event. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffff",
  },

  loadingFullContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },

  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    borderRadius: 14,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  business: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "600",
  },

  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 6,
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  statsCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15
  },

  statsNumber: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 10
  },

  statsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5
  },

  statsSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 3
  },

  subscriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  subscriptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  subscriptionTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  subscriptionDetails: {
    gap: 14,
  },

  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  subscriptionLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  subscriptionLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  subscriptionValue: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },

  freePlanMessageContainer: {
    backgroundColor: "#FFF8E7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#FFE5B4",
  },

  freePlanMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  expiredText: {
    color: "#FF7A18",
  },

  daysRemainingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  daysRemainingNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#28C76F",
  },

  daysRemainingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 2,
  },

  autoRenewalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  autoRenewalText: {
    fontSize: 14,
    fontWeight: "500",
  },

  autoRenewalActive: {
    color: "#28C76F",
  },

  autoRenewalInactive: {
    color: "#FF7A18",
  },

  upcomingPlanContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFF8E7",
    borderRadius: 12,
    padding: 12,
  },

  upcomingPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  upcomingPlanTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF7A18",
  },

  upcomingPlanName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },

  upcomingPlanDate: {
    fontSize: 12,
    color: "#666",
  },

  upgradeButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },

  upgradeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },

  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  Quickheading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222"
  },

  quickcard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3
  },

  quickiconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15
  },

  textSection: {
    flex: 1
  },

  quicktitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222"
  },

  quicksubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2
  },

  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  }
});