import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import CustomHeader from '../../components/header/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';
const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorToken, setVendorToken] = useState('');

  useEffect(() => {
    getTokenAndLoadSubscription();
  }, []);

  const getTokenAndLoadSubscription = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken') || await AsyncStorage.getItem('vendorToken');
      if (token) {
        setVendorToken(token);
        await loadSubscription(token);
      } else {
        setError('Authentication token not found');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error getting token:', err);
      setError('Failed to get authentication token');
      setLoading(false);
    }
  };

  const loadSubscription = async (token) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        setError(data.message || 'Failed to load subscription');
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planKey) => {
    if (!vendorToken) {
      Alert.alert('Error', 'Please login again');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vendorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planKey }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create order');

      Alert.alert(
        'Payment Required',
        `Amount: ₹${data.amount}\nOrder ID: ${data.orderId}\n\nPlease complete payment via Razorpay.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay Now',
            onPress: () => {
              simulatePayment(data, planKey);
            },
          },
        ]
      );
    } catch (err) {
      console.error('Purchase error:', err);
      Alert.alert('Error', err.message || 'Failed to initiate payment');
    }
  };

  const simulatePayment = async (orderData, planKey) => {
    const mockPaymentResponse = {
      razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
      razorpay_order_id: orderData.orderId,
      razorpay_signature: 'mock_signature_' + Date.now(),
    };
    await verifyPayment(mockPaymentResponse, planKey);
  };

  const verifyPayment = async (paymentResponse, planKey) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vendorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          planKey,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await loadSubscription(vendorToken);
        if (data.queued && data.upcomingPlan) {
          Alert.alert(
            'Purchase Successful!',
            `${data.upcomingPlan.planName} purchased! It will activate on ${new Date(
              data.upcomingPlan.scheduledStartDate
            ).toLocaleDateString('en-IN')} when your current plan expires.`
          );
        } else {
          Alert.alert(
            'Payment Successful!',
            data.hasBonus
              ? `${data.subscription.planName} activated! You got 30 days FREE bonus — ${data.totalDays} days total.`
              : `${data.subscription.planName} activated for ${data.totalDays} days.`
          );
        }
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      Alert.alert('Error', err.message || 'Failed to verify payment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </>
    );
  }

  if (error && !subscription) {
    return (
      <>
        <CustomHeader />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => getTokenAndLoadSubscription()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const isActive = subscription?.isActive;
  const isExpired = subscription?.isExpired;
  const isFree = subscription?.isFree;
  const daysRemaining = subscription?.daysRemaining || 0;
  const currentPlanName = subscription?.planName || 'Free';
  const currentPlanPrice = subscription?.lastPaymentAmount || 0;
  const expiryDate = subscription?.expiryDate;
  const startDate = subscription?.startDate;
  const hasUpcomingPlan = subscription?.hasUpcomingPlan;
  const upcomingPlan = subscription?.upcomingPlan;

  return (
    <>
      <CustomHeader />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* MY PLAN CARD */}
        <LinearGradient
          colors={['#5B5BEA', '#E11D48']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <View style={styles.leftSection}>
            <View style={styles.titleRow}>
              <Icon name="award" size={20} color="#fff" />
              <Text style={styles.title}> My Plan</Text>
            </View>

            <Text style={styles.subtitle}>
              Manage your subscription and billing
            </Text>
          </View>

          <View
            style={[
              styles.statusBox,
              isActive
                ? styles.statusActive
                : isExpired
                ? styles.statusExpired
                : styles.statusFree,
            ]}
          >
            <Icon
              name={isActive ? 'check-square' : isExpired ? 'alert-triangle' : 'info'}
              size={14}
              color="#fff"
            />
            <Text style={styles.statusText}>
              {isActive ? ' ACTIVE' : isExpired ? ' EXPIRED' : ' FREE PLAN'}
            </Text>
          </View>
        </LinearGradient>

        {/* ACTIVE PLAN BANNER */}
        {isActive && !isExpired && (
          <LinearGradient
            colors={daysRemaining <= 7 ? ['#EF4444', '#F59E0B'] : ['#22C55E', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.planCard}
          >
            <View style={styles.iconCircle}>
              <Icon name="clock" size={20} color="#fff" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.planTitle}>
                {daysRemaining <= 7 ? '⚠️ Plan Expiring Soon!' : `${currentPlanName} Plan Active`}
              </Text>
              <Text style={styles.planSubtitle}>
                {daysRemaining <= 7
                  ? `Your ${currentPlanName} plan expires on ${formatDate(expiryDate)}. Renew now to keep all your features.`
                  : `You have ${daysRemaining} days remaining. Plan expires on ${formatDate(expiryDate)}.`}
              </Text>
            </View>

            <View style={styles.daysBadge}>
              <Text style={styles.daysText}>
                {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* EXPIRED BANNER */}
        {isExpired && (
          <LinearGradient
            colors={['#EF4444', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.planCard}
          >
            <View style={styles.iconCircle}>
              <Icon name="alert-triangle" size={20} color="#fff" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.planTitle}>⏰ Plan Expired</Text>
              <Text style={styles.planSubtitle}>
                Your {currentPlanName} plan expired on {formatDate(expiryDate)}. 
                Your profile has been downgraded to the Free plan.
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* DETAILED PLAN CARD - Only show if user has/had a plan */}
        {(isActive || isExpired) && (
          <View style={styles.detailCard}>
            <View style={styles.headerRow}>
              <Icon name="zap" size={18} color="#4F46E5" />
              <Text style={styles.headerTitle}>
                {isActive ? ' Current Plan — ' : ' Previous Plan — '}
                {currentPlanName}
              </Text>
            </View>

            <Text style={styles.subHeader}>
              One-time purchase · No auto-renewal
            </Text>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>PLAN</Text>
                <Text style={styles.value}>{currentPlanName}</Text>

                <View
                  style={[
                    styles.activeBadge,
                    isActive ? styles.activeBadgeActive : styles.activeBadgeExpired,
                  ]}
                >
                  <Icon
                    name={isActive ? 'check-circle' : 'alert-circle'}
                    size={14}
                    color={isActive ? '#16A34A' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.activeText,
                      isActive ? styles.activeTextActive : styles.activeTextExpired,
                    ]}
                  >
                    {isActive ? ' Active' : ' Expired'}
                  </Text>
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>AMOUNT PAID</Text>
                <Text style={[styles.value, { color: '#16A34A' }]}>
                  ₹{currentPlanPrice}
                </Text>
                <Text style={styles.smallText}>One-time payment</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>START DATE</Text>
                <Text style={styles.value}>
                  {startDate ? formatDate(startDate) : 'N/A'}
                </Text>
                <Text style={styles.smallText}>Activation date</Text>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>EXPIRY DATE</Text>
                <Text
                  style={[
                    styles.value,
                    isExpired ? { color: '#EF4444' } : { color: '#7C3AED' },
                  ]}
                >
                  {expiryDate ? formatDate(expiryDate) : 'N/A'}
                </Text>
                <Text style={styles.smallText}>
                  {isActive
                    ? `${daysRemaining} days remaining`
                    : isExpired
                    ? 'Expired'
                    : 'No active plan'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.featureTitle}>Features:</Text>

            {currentPlanName === 'Starter' && (
              <>
                <View style={styles.featureRow}>
                  <Feature text="Verified vendor badge" />
                  <Feature text="Portfolio: Up to 15 media files" />
                </View>
                <View style={styles.featureRow}>
                  <Feature text="Improved placement in search results" />
                  <Feature text="Category + location SEO optimization" />
                </View>
                <Feature text="Profile reviewed & managed by AIS team" />
              </>
            )}

            {currentPlanName === 'Growth' && (
              <>
                <View style={styles.featureRow}>
                  <Feature text="Portfolio: Up to 30 media files" />
                  <Feature text="Everything in Starter" />
                </View>
                <View style={styles.featureRow}>
                  <Feature text="Higher ranking in category searches" />
                  <Feature text="Featured placement in recommended vendors" />
                </View>
                <View style={styles.featureRow}>
                  <Feature text="Portfolio enhancement" />
                  <Feature text="Basic social media promotion" />
                </View>
              </>
            )}

            {currentPlanName === 'Premium' && (
              <>
                <View style={styles.featureRow}>
                  <Feature text="Unlimited media uploads" />
                  <Feature text="Top-tier visibility in search results" />
                </View>
                <View style={styles.featureRow}>
                  <Feature text="Premium verified badge" />
                  <Feature text="Social media shoutouts & promotions" />
                </View>
                <View style={styles.featureRow}>
                  <Feature text="Dedicated profile optimization" />
                  <Feature text="Priority placement during high-demand searches" />
                </View>
              </>
            )}

            <View style={styles.warningBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="alert-circle" size={16} color="#B45309" />
                <Text style={styles.warningTitle}> No Auto-Renewal</Text>
              </View>

              <Text style={styles.warningText}>
                Your plan will {isExpired ? 'expired on' : 'expire on'}{' '}
                {expiryDate ? formatDate(expiryDate) : 'N/A'}. After expiry, your profile
                will be downgraded to the Free plan. You can renew or upgrade anytime.
              </Text>
            </View>
          </View>
        )}

        {/* UPCOMING PLAN QUEUED */}
        {hasUpcomingPlan && upcomingPlan && (
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upcomingCard}
          >
            <View style={styles.upcomingContent}>
              <View style={styles.upcomingIcon}>
                <Icon name="clock" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.upcomingHeader}>
                  <Text style={styles.upcomingTitle}>🎉 Upcoming Plan Queued</Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidBadgeText}>PAID</Text>
                  </View>
                </View>
                <Text style={styles.upcomingDescription}>
                  Your <Text style={styles.upcomingBold}>{upcomingPlan.planName}</Text>{' '}
                  plan (₹{upcomingPlan.amount}) is queued and will automatically activate on{' '}
                  <Text style={styles.upcomingBold}>
                    {new Date(upcomingPlan.scheduledStartDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>{' '}
                  when your current plan expires.
                </Text>
                <View style={styles.upcomingMeta}>
                  <Text style={styles.upcomingMetaText}>
                    📅 Duration: {upcomingPlan.totalDays} days
                    {upcomingPlan.bonusDays > 0 && ` (includes ${upcomingPlan.bonusDays} bonus)`}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* FREE PLAN SECTION */}
        {isFree && !isExpired && (
          <View style={styles.freePlanCard}>
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.freePlanHeader}
            >
              <View style={styles.freePlanHeaderRow}>
                <Icon name="info" size={20} color="#6B7280" />
                <Text style={styles.freePlanTitle}>Free Plan — Unlisted Vendor</Text>
              </View>
            </LinearGradient>
            <View style={styles.freePlanDetails}>
              <View style={styles.freePlanIconContainer}>
                <Icon name="award" size={40} color="#9CA3AF" />
              </View>
              <Text style={styles.freePlanName}>Free Plan</Text>
              <Text style={styles.freePlanDescription}>
                Entry-level presence with organic discovery
              </Text>

              <View style={styles.includedSection}>
                <Text style={styles.sectionTitle}>✓ Included:</Text>
                {[
                  'Platform registration',
                  'Service & city listing',
                  'Portfolio: Up to 5 images (no videos)',
                  'Appears in general search results',
                  'Discoverable via category & location',
                ].map((feature, i) => (
                  <View key={i} style={styles.includedFeature}>
                    <Icon name="check-circle" size={14} color="#10B981" />
                    <Text style={styles.includedFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.notIncludedSection}>
                <Text style={styles.sectionTitle}>✗ Not Included:</Text>
                {['Verified badge', 'Priority visibility', 'Marketing push'].map(
                  (feature, i) => (
                    <View key={i} style={styles.notIncludedFeature}>
                      <Icon name="x-circle" size={14} color="#EF4444" />
                      <Text style={styles.notIncludedFeatureText}>{feature}</Text>
                    </View>
                  )
                )}
              </View>

              {/* Bonus Banner */}
              {!subscription?.firstPaidBonusUsed && (
                <LinearGradient
                  colors={['#F0FDF4', '#ECFDF5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bonusBanner}
                >
                  <View style={styles.bonusContent}>
                    <View style={styles.bonusIcon}>
                      <Icon name="zap" size={20} color="#10B981" />
                    </View>
                    <View>
                      <Text style={styles.bonusTitle}>
                        🎁 First Purchase Bonus: 30 Days FREE!
                      </Text>
                      <Text style={styles.bonusText}>
                        Buy any plan now and get{' '}
                        <Text style={styles.bonusBold}>30 extra days FREE</Text> — pay for 30
                        days, get 60 days total!
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              )}
            </View>
          </View>
        )}

        {/* MANAGE PLAN CARD - Show for all users except if they have upcoming plan */}
        {!hasUpcomingPlan && (
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.manageCard}
          >
            <View style={styles.manageHeader}>
              <View style={styles.iconBg}>
                <Icon name="settings" size={18} color="#fff" />
              </View>
              <Text style={styles.manageTitle}>
                {isActive
                  ? ' Manage Your Paid Plan'
                  : isExpired
                  ? ' Reactivate Your Plan'
                  : ' Choose Your Plan'}
              </Text>
            </View>

            <Text style={styles.manageDescription}>
              {isActive
                ? 'Renew your current plan or switch to any other paid plan'
                : isExpired
                ? 'Choose a plan to restore all your features and visibility'
                : 'Select a plan to get started and unlock premium features'}
            </Text>

            <View style={styles.manageActionsRow}>
              {isActive && (
                <TouchableOpacity
                  style={styles.renewButtonSmall}
                  onPress={() => handlePurchase(subscription?.planKey)}
                >
                  <Icon name="rotate-cw" size={16} color="#667EEA" />
                  <Text style={styles.renewButtonTextSmall}>
                    Renew ₹{currentPlanPrice}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.changePlanButtonSmall,
                  isActive && subscription?.planKey === 'premium' && styles.disabledButton,
                ]}
                onPress={() => navigation.navigate('ChangePlan')}
                disabled={isActive && subscription?.planKey === 'premium'}
              >
                <Icon name="star" size={16} color="#FFB800" />
                <Text style={styles.changePlanButtonTextSmall}>
                  {isActive ? 'Change Plan' : isExpired ? 'Choose a Plan' : 'Get Started'}
                </Text>
                <Icon name="chevron-right" size={14} color="#667EEA" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
      </ScrollView>
    </>
  );
};

export default SubscriptionScreen;

/* ================= COMPONENT ================= */

const Feature = ({ text }) => (
  <View style={styles.featureItem}>
    <Icon name="check-circle" size={16} color="#16A34A" />
    <Text style={styles.featureText}> {text}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    margin: 16,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  subtitle: {
    color: '#E5E7EB',
    marginTop: 6,
    fontSize: 13,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#22C55E',
  },
  statusExpired: {
    backgroundColor: '#EF4444',
  },
  statusFree: {
    backgroundColor: '#6B7280',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  planCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  planSubtitle: {
    color: '#E0F2FE',
    fontSize: 13,
    marginTop: 4,
  },
  daysBadge: {
    borderWidth: 1,
    borderColor: '#ffffff80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  daysText: {
    color: '#fff',
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subHeader: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  col: {
    width: '48%',
  },
  label: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  smallText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  activeBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  activeBadgeExpired: {
    backgroundColor: '#FEE2E2',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeTextActive: {
    color: '#16A34A',
  },
  activeTextExpired: {
    color: '#EF4444',
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#374151',
  },
  warningBox: {
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningTitle: {
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  warningText: {
    marginTop: 6,
    fontSize: 12,
    color: '#92400E',
  },
  upcomingCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  upcomingContent: {
    flexDirection: 'row',
    padding: 16,
  },
  upcomingIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  paidBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  upcomingDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 8,
  },
  upcomingBold: {
    fontWeight: '700',
  },
  upcomingMeta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  upcomingMetaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFF',
  },
  freePlanCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  freePlanHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  freePlanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freePlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  freePlanDetails: {
    padding: 24,
    alignItems: 'center',
  },
  freePlanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  freePlanName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  freePlanDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  includedSection: {
    alignSelf: 'stretch',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  notIncludedSection: {
    alignSelf: 'stretch',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  includedFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  includedFeatureText: {
    fontSize: 12,
    color: '#374151',
  },
  notIncludedFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  notIncludedFeatureText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bonusBanner: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  bonusContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  bonusIcon: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 8,
  },
  bonusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  bonusText: {
    fontSize: 11,
    color: '#065F46',
  },
  bonusBold: {
    fontWeight: '700',
  },
  manageCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  manageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  manageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  manageDescription: {
    fontSize: 12,
    color: '#F0F0FF',
    lineHeight: 16,
    marginBottom: 16,
    opacity: 0.95,
  },
  manageActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  renewButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  renewButtonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  changePlanButtonSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  changePlanButtonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  disabledButton: {
    opacity: 0.5,
  },
});