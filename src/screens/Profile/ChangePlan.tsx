import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import React, { useState, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const ChangePlan = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly') 
  
  const [activeCard, setActiveCard] = useState(null)

  const scaleAnim = useRef(new Animated.Value(1)).current

  const monthlyPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '499',
      period: '/30 days',
      icon: 'leaf',
      iconColor: '#4caf50',
      bgColor: '#e8f5e9',
      borderColor: '#4caf50',
      buttonColor: '#4caf50',
      features: [
        'Verified vendor badge',
        'Portfolio: Up to 15 media files',
        'Improved placement in search results',
        'Category + location SEO optimization',
        'Profile reviewed & managed by AIS team'
      ],
      currentPlan: true
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '999',
      period: '/30 days',
      icon: 'chart-line',
      iconColor: '#9c27b0',
      bgColor: '#f3e5f5',
      borderColor: '#9c27b0',
      buttonColor: '#9c27b0',
      features: [
        'Portfolio: Up to 30 media files',
        'Everything in Starter',
        'Higher ranking in category searches',
        'Featured placement in recommended vendors',
        'Portfolio enhancement'
      ],
      currentPlan: false,
      highlight: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '1499',
      period: '/30 days',
      icon: 'crown',
      iconColor: '#ff9800',
      bgColor: '#ffffff',
      borderColor: '#ff9800',
      buttonColor: '#ff9800',
      features: [
        'Unlimited media uploads',
        'Top-tier visibility in search results',
        'Premium verified badge',
        'Social media shoutouts & promotions',
        'Dedicated profile optimization',
        'Priority placement during high-demand searches'
      ],
      currentPlan: false
    }
  ]

  const handleCardPress = (cardId) => {
    // Start zoom animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start()
    
    setActiveCard(cardId === activeCard ? null : cardId)
  }

  const renderPlanCard = (plan, index) => {
    const isCurrentPlan = plan.currentPlan
    const isHighlighted = plan.highlight
    const isActive = activeCard === plan.id

    return (
      <Animated.View 
        key={plan.id} 
        style={[
          styles.card,
          { 
            backgroundColor: plan.bgColor,
            transform: [{ scale: isActive ? 1.02 : 1 }]
          },
          isHighlighted && styles.highlightedCard,
        ]}
      >
        {isHighlighted && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </View>
        )}
        
        {/* Icon and Title Center */}
        <View style={styles.iconContainer}>
          <Icon name={plan.icon} size={48} color={plan.iconColor} />
          <Text style={styles.planName}>{plan.name}</Text>
        </View>
        
        {/* Price Center with Rupee Icon */}
        <View style={styles.priceContainer}>
          <Icon name="currency-inr" size={28} color="#1a1a1a" />
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.period}>{plan.period}</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Icon name="check-circle" size={16} color={plan.iconColor} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {isCurrentPlan ? (
          <TouchableOpacity 
            style={[styles.currentPlanButton, { 
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: plan.buttonColor
            }]}
            onPress={() => handleCardPress(plan.id)}
          >
            <Icon name="check-circle" size={20} color={plan.buttonColor} />
            <Text style={[styles.currentPlanText, { color: plan.buttonColor }]}>
              Current Plan
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.switchButton, { 
              backgroundColor: plan.buttonColor,
              borderWidth: 1,
              borderColor: plan.buttonColor
            }]}
            onPress={() => handleCardPress(plan.id)}
          >
            <Icon name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.switchButtonText}>
              Switch Plan — ₹{plan.price}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>YOUR PLAN</Text>
        <Text style={styles.subtitle}>
          Select monthly or yearly billing — no auto-renewal
        </Text>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedPlan === 'monthly' && styles.activeToggle
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPlan === 'monthly' && styles.activeToggleText
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedPlan === 'yearly' && styles.activeToggle
            ]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPlan === 'yearly' && styles.activeToggleText
            ]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 17%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Plan Cards - Only Monthly */}
        <View style={styles.cardsContainer}>
          {monthlyPlans.map((plan, index) => renderPlanCard(plan, index))}
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Icon name="information" size={16} color="#ffc107" style={styles.footerIcon} />
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>How it works:</Text>
            <Text style={styles.footerText}>
              Each plan is a one-time payment for its selected term (monthly or yearly). No auto-renewal — you manually renew when you want. After expiry, your profile will be downgraded to the Free plan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8ecf0',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: 'center',
    position: 'relative',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeToggleText: {
    color: '#007bff',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    transition: 'all 0.3s ease',
  },
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#ff4757',
    shadowColor: '#ff4757',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#ff4757',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  period: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 4,
  },
  featuresContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
  },
  currentPlanButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  switchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerNote: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  footerContent: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
})

export default ChangePlan