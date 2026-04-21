// import React, { useState, useEffect } from 'react';
// import { styles } from './MyPlanStyle';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   Linking,
//   Share,
//   PermissionsAndroid
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { WebView } from 'react-native-webview';
// import RazorpayCheckout from 'react-native-razorpay';
// import axios from 'axios';
// import CustomHeader from '../../components/header/CustomHeader';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import LinearGradient from 'react-native-linear-gradient';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const API_BASE_URL = 'https://api.aissignatureevent.com/api';
// import RNFS from 'react-native-fs';


// const VendorSubscriptionManager = () => {
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showPlanModal, setShowPlanModal] = useState(false);
//   const [purchasing, setPurchasing] = useState(false);
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptHTML, setReceiptHTML] = useState('');
//   const [vendorToken, setVendorToken] = useState(null);
//   const [currentOrderId, setCurrentOrderId] = useState(null);
//   const [logoBase64, setLogoBase64] = useState('');
//   const availablePlans = [
//     {
//       id: 'starter',
//       name: 'Starter',
//       price: 499,
//       icon: '⚡',
//       color: '#3B82F6',
//       features: [
//         'Verified vendor badge',
//         'Portfolio: Up to 15 media files',
//         'Improved placement in search results',
//         'Category + location SEO optimization',
//         'Profile reviewed & managed by AIS team'
//       ]
//     },
//     {
//       id: 'growth',
//       name: 'Growth',
//       price: 999,
//       icon: '📈',
//       color: '#FF9800',
//       popular: true,
//       features: [
//         'Portfolio: Up to 30 media files',
//         'Everything in Starter',
//         'Higher ranking in category searches',
//         'Featured placement in recommended vendors',
//         'Portfolio enhancement',
//         'Basic social media promotion'
//       ]
//     },
//     {
//       id: 'premium',
//       name: 'Premium',
//       price: 1499,
//       icon: '👑',
//       color: '#8B5CF6',
//       features: [
//         'Unlimited media uploads',
//         'Top-tier visibility in search results',
//         'Premium verified badge',
//         'Social media shoutouts & promotions',
//         'Dedicated profile optimization',
//         'Priority placement during high-demand searches'
//       ]
//     }
//   ];

//   // Get token on component mount
//   useEffect(() => {
//     getToken();
//   }, []);

//   // Load subscription after token is available
//   useEffect(() => {
//     if (vendorToken) {
//       loadSubscription();
//     }
//   }, [vendorToken]);

//   const getToken = async () => {
//     try {
//       const authToken = await AsyncStorage.getItem('authToken');
//       const vendorTokenStorage = await AsyncStorage.getItem('vendorToken');

//       const finalToken = authToken || vendorTokenStorage;
//       console.log('Token retrieved:', finalToken ? 'Yes' : 'No');

//       setVendorToken(finalToken);

//       if (!finalToken) {
//         setError('No authentication token found. Please login again.');
//         setLoading(false);
//       }
//     } catch (error) {
//       console.log('Error getting token:', error);
//       setError('Failed to authenticate. Please login again.');
//       setLoading(false);
//     }
//   };

//   const loadSubscription = async () => {
//     if (!vendorToken) {
//       setError('Authentication required');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       const response = await fetch(`${API_BASE_URL}/subscription/status`, {
//         headers: {
//           'Authorization': `Bearer ${vendorToken}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = await response.json();
//       if (data.success) {
//         setSubscription(data.subscription);
//       } else {
//         setError(data.message || 'Failed to load subscription');
//       }
//     } catch (err) {
//       console.error('Error loading subscription:', err);
//       setError('Failed to load subscription details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const initiatePayment = async (planKey) => {
//     if (!vendorToken) {
//       Alert.alert('Error', 'Please login again to continue');
//       return;
//     }

//     setPurchasing(true);
//     setError('');

//     try {
//       console.log('1. Creating order:', planKey);

//       const response = await fetch(`${API_BASE_URL}/subscription/purchase`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${vendorToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ planKey })
//       });

//       const data = await response.json();
//       console.log('2. Order response:', data);

//       if (!data.success) {
//         throw new Error(data.message || 'Failed to create order');
//       }

//       const amountInPaise = Number(data.amount);

//       if (!amountInPaise || amountInPaise <= 0) {
//         throw new Error('Invalid amount');
//       }

//       setCurrentOrderId(data.orderId);

//       const options = {
//         key: 'rzp_live_SQbIdkWnB4MDHg',
//         amount: amountInPaise,
//         currency: 'INR',
//         name: 'AIS Signature',
//         description: data.planName,
//         order_id: data.orderId,

//         prefill: {
//           name: subscription?.vendorName || 'Test User',
//           email: subscription?.vendorEmail || 'test@razorpay.com',
//           contact: subscription?.vendorPhone || '9999999999'
//         },

//         method: {
//           upi: true,
//           card: true,
//           netbanking: true,
//           wallet: false
//         },

//         external: {
//           wallets: ['paytm', 'phonepe']
//         },

//         theme: {
//           color: '#4F46E5'
//         },

//         modal: {
//           ondismiss: () => {
//             setPurchasing(false);
//             if (currentOrderId) cancelOrder(currentOrderId);
//           }
//         }
//       };

//       console.log('3. Opening Razorpay');

//       RazorpayCheckout.open(options)
//         .then(async (paymentResponse) => {
//           console.log('4. Payment success:', paymentResponse);
//           await verifyPayment(paymentResponse, planKey, data.orderId);
//         })
//         .catch((error) => {
//           console.log('5. Payment failed:', error);
//           setPurchasing(false);
//           if (currentOrderId) cancelOrder(currentOrderId);
//         });

//     } catch (err) {
//       console.log('Error:', err);
//       setError(err.message);
//       setPurchasing(false);
//       Alert.alert('Error', err.message);
//     }
//   };

//   const handlePurchase = (planKey) => {
//     initiatePayment(planKey);
//   };

//   const cancelOrder = async (orderId) => {
//     if (!orderId) return;

//     try {
//       await fetch(`${API_BASE_URL}/subscription/cancel-order-auth`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${vendorToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ orderId })
//       });
//       console.log('Order cancelled:', orderId);
//     } catch (err) {
//       console.error('Error cancelling order:', err);
//     }
//   };

//   const verifyPayment = async (paymentResponse, planKey, orderId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/subscription/verify-payment`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${vendorToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           razorpay_payment_id: paymentResponse.razorpay_payment_id,
//           razorpay_order_id: paymentResponse.razorpay_order_id,
//           razorpay_signature: paymentResponse.razorpay_signature,
//           planKey
//         })
//       });

//       const data = await response.json();
//       if (data.success) {
//         setShowPlanModal(false);
//         await loadSubscription();

//         if (data.queued && data.upcomingPlan) {
//           Alert.alert(
//             'Success!',
//             `🎉 ${data.upcomingPlan.planName} purchased! It will activate on ${new Date(data.upcomingPlan.scheduledStartDate).toLocaleDateString('en-IN')} when your current plan expires.`
//           );
//         } else {
//           Alert.alert(
//             'Success!',
//             data.hasBonus
//               ? `🎉 ${data.subscription.planName} activated! You got 30 days FREE bonus — ${data.totalDays} days total.`
//               : `✅ ${data.subscription.planName} activated for ${data.totalDays} days.`
//           );
//         }
//         setCurrentOrderId(null);
//       } else {
//         throw new Error(data.message || 'Payment verification failed');
//       }
//     } catch (err) {
//       console.error('Verification error:', err);
//       setError(err.message || 'Failed to verify payment');
//       Alert.alert('Error', err.message || 'Failed to verify payment. Please contact support with your payment ID if amount was deducted.');
//     } finally {
//       setPurchasing(false);
//     }
//   };

//   const saveReceiptToDevice = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//           {
//             title: 'Storage Permission',
//             message: 'App needs access to storage to save receipts',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );

//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           Alert.alert('Permission Denied', 'Cannot save receipt without storage permission.');
//           return;
//         }
//       }

//       const fileName = `Receipt_${Date.now()}.html`;
//       let filePath;

//       if (Platform.OS === 'android') {
//         const downloadsPath = RNFS.DownloadDirectoryPath;
//         filePath = `${downloadsPath}/${fileName}`;
//       } else {
//         filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
//       }

//       await RNFS.writeFile(filePath, receiptHTML, 'utf8');

//       Alert.alert(
//         'Success!',
//         `Receipt saved successfully!\n\nLocation: ${filePath}`,
//         [
//           { text: 'OK' },
//         ]
//       );

//     } catch (error) {
//       console.log('Error saving receipt:', error);
//       Alert.alert('Error', 'Failed to save receipt. Please try again.');
//     }
//   };

//  const downloadReceipt = async (paymentId) => {
//   if (!paymentId) {
//     Alert.alert('Error', 'No payment ID available. Please try again later.');
//     return;
//   }

//   setPurchasing(true);

//   try {
//     console.log('Fetching receipt for payment ID:', paymentId);

//     const response = await fetch(`${API_BASE_URL}/subscription/receipt/${paymentId}`, {
//       headers: {
//         'Authorization': `Bearer ${vendorToken}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     const data = await response.json();
//     console.log('Receipt response:', data);

//     if (!data.success) {
//       throw new Error(data.message || 'Failed to generate receipt. Payment may not be found.');
//     }

//     const r = data.receipt;
//     const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', {
//       weekday: 'short',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     }) : 'N/A';
//     const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit'
//     }) : '';
//     const invoiceNo = `INV-${r.paymentId?.slice(-8)?.toUpperCase() || Date.now()}`;

//     const logoUrl = 'https://aissignatureevent.com/AIS_LOGO_TRANS.png';

//     const receiptHTMLContent = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
//   <title>Invoice ${invoiceNo} - AIS Signature</title>
//   <style>
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }
    
//     body {
//       background: #f3f4f6;
//       padding: 20px;
//       font-family: -apple-system, 'Helvetica Neue', sans-serif;
//     }
    
//     .invoice-container {
//       max-width: 800px;
//       margin: 0 auto;
//       background: #fff;
//       border-radius: 12px;
//       box-shadow: 0 4px 6px -1px rgba(0,0,0,.1);
//       overflow: hidden;
//     }
    
//     .header {
//       background: linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);
//       display: flex;
//       justify-content: space-between;
//       align-items: stretch;
//       flex-wrap: wrap;
//     }
    
//     .brand {
//       display: flex;
//       width: 50%;
//       min-width: 200px;
//     }
    
//     .logo-box {
//       background: #ede9fe;
//       padding: 30px;
//       width: 100%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }
    
//     .logo-box img {
//       width: 100%;
//       height: auto;
//       max-height: 150px;
//       object-fit: contain;
//     }
    
//     .invoice-meta {
//       text-align: right;
//       padding: 30px;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       color : #fff;
//     }
    
//     .invoice-meta h2 {
//       font-size: 12px;
//       text-transform: uppercase;
//       letter-spacing: 2px;
//       opacity: .9;
//       margin-bottom: 8px;
//     }
    
//     .invoice-meta .invoice-number {
//       font-size: 20px;
//       font-weight: 700;
//     }
    
//     .status-badge {
//       display: inline-block;
//       background: #10b981;
//       padding: 4px 12px;
//       border-radius: 20px;
//       font-size: 12px;
//       font-weight: 600;
//       margin-top: 10px;
//     }
    
//     .content {
//       padding: 30px;
//     }
    
//     .parties {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 20px;
//       margin-bottom: 30px;
//     }
    
//     .party {
//       padding: 20px;
//       background: #f9fafb;
//       border-radius: 10px;
//       border: 1px solid #e5e7eb;
//     }
    
//     .party h3 {
//       font-size: 11px;
//       text-transform: uppercase;
//       letter-spacing: 1.5px;
//       color: #6b7280;
//       margin-bottom: 12px;
//     }
    
//     .party .name {
//       font-weight: 600;
//       font-size: 15px;
//       color: #111827;
//     }
    
//     .table-container {
//       margin-bottom: 30px;
//     }
    
//     .table-header {
//       display: grid;
//       grid-template-columns: 1.3fr 1.3fr 1fr 1fr;
//       background: #f3f4f6;
//       padding: 9px;
//       font-weight: 600;
//       font-size: 9px;
//       text-transform: uppercase;
//     }
    
//     .table-row {
//       display: grid;
//       grid-template-columns: 1fr 1fr 1fr 1fr;
//       padding: 9px;
//       border-bottom: 1px solid #e5e7eb;
//       font-size: 9px;
//     }
    
//     .summary {
//       background: #f9fafb;
//       border-radius: 10px;
//       padding: 20px;
//       margin-bottom: 30px;
//     }
    
//     .summary-row {
//       display: flex;
//       justify-content: space-between;
//       padding: 10px 0;
//       border-bottom: 1px solid #e5e7eb;
//     }
    
//     .summary-row.total {
//       border-top: 2px solid #4F46E5;
//       margin-top: 10px;
//       padding-top: 15px;
//     }
    
//     .payment-info {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 12px;
//       margin-bottom: 30px;
//     }
    
//     .payment-item {
//       padding: 15px;
//       background: #f9fafb;
//       border-radius: 10px;
//       text-align: center;
//     }
    
//     .footer {
//       background: #f9fafb;
//       padding: 20px 30px;
//       border-top: 1px solid #e5e7eb;
//       text-align: center;
//     }
    
//     .print-btn-container {
//       padding: 20px 30px;
//       background: #fff;
//       border-top: 1px solid #e5e7eb;
//       text-align: center;
//     }
    
//     .print-btn {
//       display: inline-block;
//       background: #4F46E5;
//       color: white;
//       padding: 12px 24px;
//       border-radius: 8px;
//       text-decoration: none;
//       font-weight: 600;
//       font-size: 14px;
//       cursor: pointer;
//       border: none;
//       margin: 0 10px;
//     }
    
//     .print-btn:hover {
//       background: #4338CA;
//     }
    
//     @media print {
//       .print-btn-container {
//         display: none;
//       }
//       body {
//         padding: 0;
//         background: white;
//       }
//       .invoice-container {
//         box-shadow: none;
//       }
//     }
    
//     @media (max-width: 600px) {
//       .header {
//         flex-direction: column;
//       }
//       .brand {
//         width: 100%;
//       }
//       .invoice-meta {
//         text-align: left;
//         padding: 20px;
//       }
//       .parties {
//         grid-template-columns: 1fr;
//       }
//       .payment-info {
//         grid-template-columns: 1fr;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="invoice-container">
//     <div class="header">
//       <div class="brand">
//         <div class="logo-box">
//           <img src="${logoUrl}" alt="AIS Signature" />
//         </div>
//       </div>
//       <div class="invoice-meta">
//         <h2>Tax Invoice</h2>
//         <div class="invoice-number">${invoiceNo}</div>
//         <div class="invoice-date">${formatDate(r.date)} at ${formatTime(r.date)}</div>
//         <div class="status-badge">✓ PAID</div>
//       </div>
//     </div>
    
//     <div class="content">
//       <div class="parties">
//         <div class="party">
//           <h3>From</h3>
//           <p class="name">ORBOSIS VIBEZ EVENT & MARKETING PRIVATE LIMITED</p>
//           <p>info@aissignatureevent.com</p>
//         </div>
//         <div class="party">
//           <h3>Bill To</h3>
//           <p class="name">${r.vendorName || 'Vendor'}</p>
//           <p>${r.vendorEmail || 'N/A'}</p>
//         </div>
//       </div>
      
//       <div class="table-container">
//         <div class="table-header">
//           <span>Description</span>
//           <span>Duration</span>
//           <span>Type</span>
//           <span>Amount</span>
//         </div>
//         <div class="table-row">
//           <div>
//             <div class="plan-name">${r.planName || 'Subscription Plan'}</div>
//             <div>Plan: ${r.planKey || 'N/A'}</div>
//           </div>                
//           <div>${r.durationDays || 30} days${r.bonusDays ? ' +' + r.bonusDays + ' bonus' : ''}</div>
//           <div>${r.type || 'Purchase'}</div>
//           <div style="text-align:right">₹${(r.amount || 0).toLocaleString('en-IN')}</div>
//         </div>
//       </div>
      
//       <div class="summary">
//         <div class="summary-row"><span>Subtotal</span><span>₹${(r.amount || 0).toLocaleString('en-IN')}</span></div>
//         <div class="summary-row"><span>Tax</span><span>₹0.00</span></div>
//         <div class="summary-row total"><span>Total Amount</span><span>₹${(r.amount || 0).toLocaleString('en-IN')}</span></div>
//       </div>
      
//       <div class="payment-info">
//         <div class="payment-item">
//           <div class="label">Payment ID</div>
//           <div class="value">${r.paymentId || 'N/A'}</div>
//         </div>
//         <div class="payment-item">
//           <div class="label">Order ID</div>
//           <div class="value">${r.orderId || 'N/A'}</div>
//         </div>
//         <div class="payment-item">
//           <div class="label">Payment Method</div>
//           <div class="value">Razorpay</div>
//         </div>
//       </div>
//     </div>
    
//     <div class="footer">
//       <p>Thank you for choosing ORBOSIS VIBEZ EVENT & MARKETING PRIVATE LIMITED!</p>
//       <p style="font-size: 11px; margin-top: 10px;">This is a computer-generated invoice.</p>
//     </div>
    
//     <div class="print-btn-container">
//       <button class="print-btn" onclick="window.print();">🖨️ Print / Save as PDF</button>
//     </div>
//   </div>
  
//   <script>
//     if (window.location.search.includes('print=true')) {
//       setTimeout(() => window.print(), 500);
//     }
//   </script>
// </body>
// </html>`;

//     setReceiptHTML(receiptHTMLContent);
//     setShowReceiptModal(true);

//   } catch (err) {
//     console.error('Download receipt error:', err);
//     Alert.alert(
//       'Error',
//       err.message || 'Failed to download receipt. Please try again.',
//       [{ text: 'OK' }]
//     );
//   } finally {
//     setPurchasing(false);
//   }
// };
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric', month: 'short', year: 'numeric'
//     });
//   };

//   const renderPlanCard = (plan, isCurrentPlan = false, canPurchase = true, isRenewal = false) => {
//     const totalDays = !subscription?.firstPaidBonusUsed ? 60 : 30;

//     return (
//       <View key={plan.id} style={[
//         styles.planCard,
//         plan.popular && styles.popularPlanCard,
//         isCurrentPlan && styles.currentPlanCard
//       ]}>
//         {plan.popular && (
//           <View style={styles.popularBadge}>
//             <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
//           </View>
//         )}

//         {isCurrentPlan && (
//           <View style={styles.currentPlanBadge}>
//             <Text style={styles.currentPlanBadgeText}>✓ YOUR PLAN</Text>
//           </View>
//         )}

//         <View style={styles.planHeader}>
//           <View style={[styles.planIconContainer, { backgroundColor: plan.color }]}>
//             <Text style={styles.planIconText}>{plan.icon}</Text>
//           </View>
//           <Text style={[styles.planName, plan.popular && styles.planNameLight]}>
//             {plan.name}
//           </Text>
//           <View style={styles.priceContainer}>
//             <Text style={[styles.price, plan.popular && styles.priceLight]}>
//               ₹{plan.price}
//             </Text>
//             <Text style={[styles.priceDuration, plan.popular && styles.priceDurationLight]}>
//               /30 days
//             </Text>
//           </View>

//           {!subscription?.firstPaidBonusUsed && canPurchase && (
//             <View style={styles.bonusBadge}>
//               <Text style={styles.bonusBadgeText}>🎁 Get {totalDays} days (30 + 30 FREE)</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.featuresList}>
//           {plan.features.map((feature, idx) => (
//             <View key={idx} style={styles.featureItem}>
//               <Text style={styles.featureCheck}>✓</Text>
//               <Text style={[styles.featureText, plan.popular && styles.featureTextLight]}>
//                 {feature}
//               </Text>
//             </View>
//           ))}
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.purchaseButton,
//             isCurrentPlan && styles.currentPlanButton,
//             (!canPurchase || purchasing) && styles.disabledButton,
//             (plan.id === 'growth' || plan.name === 'Growth') && !isCurrentPlan && styles.growthPlanButton,
//           ]}
//           onPress={() => canPurchase && handlePurchase(plan.id)}
//           disabled={!canPurchase || purchasing}
//         >
//           <Text style={[
//             styles.purchaseButtonText,
//             (!canPurchase || purchasing) && styles.disabledButtonText,
//             (plan.id === 'growth' || plan.name === 'Growth') && !isCurrentPlan && styles.growthPlanButtonText,
//           ]}>
//             {purchasing ? 'Processing...' :
//               isCurrentPlan ? 'Current Plan' :
//                 isRenewal ? `Renew — ₹${plan.price}` :
//                   !subscription?.firstPaidBonusUsed ? `Get ${totalDays} Days — ₹${plan.price}` :
//                     `Buy — ₹${plan.price}`}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//       </View>
//     );
//   }

//   if (error && !subscription) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorIcon}>⚠️</Text>
//         <Text style={styles.errorTitle}>Error</Text>
//         <Text style={styles.errorMessage}>{error}</Text>
//       </View>
//     );
//   }

//   const isActive = subscription?.isActive;
//   const isExpired = subscription?.isExpired;
//   const isFree = subscription?.isFree;
//   const daysRemaining = subscription?.daysRemaining || 0;
//   const currentPlan = availablePlans.find(p => p.id === subscription?.planKey);
//   const bonusUsed = subscription?.firstPaidBonusUsed;

//   return (
//     <>
//       <CustomHeader />
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         {/* Main Card */}
//         <View style={styles.mainCard}>
//           {/* Header */}
//           <LinearGradient
//             colors={['#4F46E5', '#D946EF']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={styles.header}
//           >
//             <View style={styles.headerContent}>
//               <View>
//                 <View style={styles.headerTitleRow}>
//                   <Icon name="crown" size={22} color="#fff" />
//                   <Text style={styles.headerTitle}>My Plan</Text>
//                 </View>

//                 <Text style={styles.headerSubtitle}>
//                   Manage your subscription and billing
//                 </Text>
//               </View>

//               <View style={[
//                 styles.statusBadge,
//                 isActive && styles.statusActive,
//                 isExpired && styles.statusExpired,
//                 isFree && styles.statusFree
//               ]}>
//                 <Text style={styles.statusText}>
//                   {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'FREE PLAN'}
//                 </Text>
//               </View>
//             </View>
//           </LinearGradient>

//           <View style={styles.content}>
//             {/* ===== ACTIVE PAID PLAN ===== */}
//             {isActive && currentPlan && (
//               <>
//                 <View style={[
//                   styles.countdownBanner,
//                   daysRemaining <= 7 && styles.countdownBannerWarning
//                 ]}>
//                   <View style={styles.countdownDays}>
//                     <Text style={styles.countdownDaysText}>
//                       {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
//                     </Text>
//                   </View>
//                   <View style={styles.countdownContent}>
//                     <View style={styles.countdownTextContainer}>
//                       <Text style={styles.countdownTitle}>
//                         {daysRemaining <= 7 ? '⚠️ Plan Expiring Soon!' : `${subscription.planName} Plan Active`}
//                       </Text>
//                       <Text style={styles.countdownDescription}>
//                         {daysRemaining <= 7
//                           ? `Your ${subscription.planName} plan expires on ${formatDate(subscription.expiryDate)}. Renew now to keep all your features.`
//                           : `You have ${daysRemaining} days remaining. Plan expires on ${formatDate(subscription.expiryDate)}.`
//                         }
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.currentPlanDetails}>
//                   <View style={styles.currentPlanHeader}>
//                     <Text style={styles.currentPlanTitle}>
//                       Current Plan — {subscription.planName}
//                     </Text>
//                     <Text style={styles.currentPlanSubtitle}>One-time purchase · No auto-renewal</Text>
//                   </View>
//                   <View style={styles.currentPlanInfo}>
//                     <View style={styles.infoItem}>
//                       <Text style={styles.infoLabel}>Plan</Text>
//                       <Text style={styles.infoValue}>{subscription.planName}</Text>
//                       <View style={styles.activeBadge}>
//                         <Text style={styles.activeBadgeText}>✓ Active</Text>
//                       </View>
//                     </View>
//                     <View style={styles.infoItem}>
//                       <Text style={styles.infoLabel}>Amount Paid</Text>
//                       <Text style={styles.infoValueLarge}>₹{subscription.lastPaymentAmount}</Text>
//                       <Text style={styles.infoSmall}>One-time payment</Text>
//                     </View>
//                     <View style={styles.infoItem}>
//                       <Text style={styles.infoLabel}>Start Date</Text>
//                       <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
//                       <Text style={styles.infoSmall}>Activation date</Text>
//                     </View>
//                     <View style={styles.infoItem}>
//                       <Text style={styles.infoLabel}>Expiry Date</Text>
//                       <Text style={[styles.infoValue, daysRemaining <= 7 && styles.expiryWarning]}>
//                         {formatDate(subscription.expiryDate)}
//                       </Text>
//                       <Text style={styles.infoSmall}>{daysRemaining} days remaining</Text>
//                     </View>
//                   </View>

//                   <View style={styles.featuresSection}>
//                     <Text style={styles.featuresTitle}>Active Features:</Text>
//                     <View style={styles.featuresGrid}>
//                       {currentPlan.features.map((feature, idx) => (
//                         <View key={idx} style={styles.featureGridItem}>
//                           <Text style={styles.featureGridCheck}>✓</Text>
//                           <Text style={styles.featureGridText}>{feature}</Text>
//                         </View>
//                       ))}
//                     </View>
//                   </View>

//                   <View style={styles.warningNotice}>
//                     <Text style={styles.warningIcon}>⚠️</Text>
//                     <View>
//                       <Text style={styles.warningTitle}>No Auto-Renewal</Text>
//                       <Text style={styles.warningText}>
//                         Your plan will expire on <Text style={styles.warningBold}>{formatDate(subscription.expiryDate)}</Text>.
//                         After expiry, your profile will be downgraded to the Free plan.
//                         You can renew or upgrade anytime before or after expiry.
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 {subscription.hasUpcomingPlan && subscription.upcomingPlan && (
//                   <View style={styles.upcomingPlanBanner}>
//                     <View style={styles.upcomingPlanContent}>
//                       <Text style={styles.upcomingPlanIcon}>⏰</Text>
//                       <View style={styles.upcomingPlanTextContainer}>
//                         <View style={styles.upcomingPlanHeader}>
//                           <Text style={styles.upcomingPlanTitle}>🎉 Upcoming Plan Queued</Text>
//                           <View style={styles.upcomingPlanBadge}>
//                             <Text style={styles.upcomingPlanBadgeText}>PAID</Text>
//                           </View>
//                         </View>
//                         <Text style={styles.upcomingPlanDescription}>
//                           Your <Text style={styles.upcomingPlanBold}>{subscription.upcomingPlan.planName}</Text>
//                           plan (₹{subscription.upcomingPlan.amount}) is queued and will
//                           automatically activate on <Text style={styles.upcomingPlanBold}>{new Date(subscription.upcomingPlan.scheduledStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> when
//                           your current plan expires.
//                         </Text>
//                         <View style={styles.upcomingPlanDuration}>
//                           <Text style={styles.upcomingPlanDurationText}>
//                             📅 Duration: {subscription.upcomingPlan.totalDays} days
//                             {subscription.upcomingPlan.bonusDays > 0 && ` (includes ${subscription.upcomingPlan.bonusDays} bonus)`}
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {!subscription.hasUpcomingPlan && (
//                   <View style={styles.actionBanner}>
//                     <View>
//                       <Text style={styles.actionTitle}>
//                         {daysRemaining <= 7 ? '⚠️ Renew Before Expiry!' : 'Renew or Change Plan'}
//                       </Text>
//                       <Text style={styles.actionSubtitle}>
//                         {daysRemaining <= 7
//                           ? 'Your plan is about to expire. Renew now to avoid losing features.'
//                           : 'Extend your plan or change to a different plan to suit your needs.'
//                         }
//                       </Text>
//                     </View>
//                     <View style={styles.actionButtons}>
//                       <TouchableOpacity
//                         style={styles.renewButton}
//                         onPress={() => handlePurchase(subscription.planKey)}
//                         disabled={purchasing}
//                       >
//                         <Text style={styles.renewButtonText}>
//                           Renew ₹{subscription.lastPaymentAmount}
//                         </Text>
//                       </TouchableOpacity>

//                       {subscription.planKey === 'premium' ? (
//                         <TouchableOpacity
//                           style={styles.changePlanButton}
//                           onPress={() => setShowPlanModal(true)}
//                         >
//                           <Text style={styles.changePlanButtonText}>Change Plan</Text>
//                         </TouchableOpacity>
//                       ) : (
//                         <TouchableOpacity
//                           style={styles.upgradeButton}
//                           onPress={() => setShowPlanModal(true)}
//                         >
//                           <Text style={styles.upgradeButtonText}>Upgrade</Text>
//                         </TouchableOpacity>
//                       )}
//                     </View>
//                   </View>
//                 )}
//               </>
//             )}

//             {/* ===== EXPIRED PLAN ===== */}
//             {isExpired && (
//               <>
//                 <View style={styles.expiredBanner}>
//                   <View style={styles.expiredContent}>
//                     <Text style={styles.expiredIcon}>⚠️</Text>
//                     <View>
//                       <Text style={styles.expiredTitle}>⏰ Plan Expired</Text>
//                       <Text style={styles.expiredDescription}>
//                         Your <Text style={styles.expiredBold}>{subscription.planName}</Text> plan expired on <Text style={styles.expiredBold}>{formatDate(subscription.expiryDate)}</Text>.
//                         Your profile has been downgraded to the Free plan. Renew or choose a new plan to restore all features.
//                       </Text>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.expiredPlanCard}>
//                   <View style={styles.expiredPlanHeader}>
//                     <Text style={styles.expiredPlanTitle}>⚠️ Previous Plan — {subscription.planName} (Expired)</Text>
//                   </View>
//                   <View style={styles.expiredPlanInfo}>
//                     <View>
//                       <Text style={styles.infoLabel}>Plan</Text>
//                       <Text style={styles.infoValue}>{subscription.planName}</Text>
//                       <View style={styles.expiredBadge}>
//                         <Text style={styles.expiredBadgeText}>Expired</Text>
//                       </View>
//                     </View>
//                     <View>
//                       <Text style={styles.infoLabel}>Was Active From</Text>
//                       <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
//                     </View>
//                     <View>
//                       <Text style={styles.infoLabel}>Expired On</Text>
//                       <Text style={[styles.infoValue, styles.expiredText]}>{formatDate(subscription.expiryDate)}</Text>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.reactivateBanner}>
//                   <View>
//                     <Text style={styles.reactivateTitle}>Reactivate Your Plan</Text>
//                     <Text style={styles.reactivateSubtitle}>Choose a plan to restore all your features and visibility</Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.reactivateButton}
//                     onPress={() => setShowPlanModal(true)}
//                   >
//                     <Text style={styles.reactivateButtonText}>Choose a Plan →</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}

//             {/* ===== FREE PLAN ===== */}
//             {isFree && !isExpired && (
//               <View style={styles.freePlanCard}>
//                 <View style={styles.freePlanHeader}>
//                   <Text style={styles.freePlanTitle}>
//                     <Icon name="alert-circle" size={20} color="#bdbdbc" /> Free Plan — Unlisted Vendor
//                   </Text>
//                 </View>
//                 <View style={styles.freePlanContent}>
//                   <View style={styles.freePlanIconContainer}>
//                     <Icon name="crown" size={20} color="#FFD700" style={styles.freePlanIcon} />
//                   </View>
//                   <Text style={styles.freePlanName}>Free Plan</Text>
//                   <Text style={styles.freePlanDescription}>Entry-level presence with organic discovery</Text>

//                   <View style={styles.includedFeatures}>
//                     <Text style={styles.includedTitle}>✓ Included:</Text>
//                     {['Platform registration', 'Service & city listing', 'Portfolio: Up to 5 images (no videos)', 'Appears in general search results', 'Discoverable via category & location'].map((f, i) => (
//                       <View key={i} style={styles.featureRow}>
//                         <Text style={styles.checkIcon}>✓</Text>
//                         <Text style={styles.featureRowText}>{f}</Text>
//                       </View>
//                     ))}
//                   </View>

//                   <View style={styles.excludedFeatures}>
//                     <Text style={styles.excludedTitle}>✗ Not Included:</Text>
//                     {['Verified badge', 'Priority visibility', 'Marketing push'].map((f, i) => (
//                       <View key={i} style={styles.featureRow}>
//                         <Text style={styles.xIcon}>✗</Text>
//                         <Text style={styles.featureRowTextExcluded}>{f}</Text>
//                       </View>
//                     ))}
//                   </View>

//                   {!bonusUsed && (
//                     <View style={styles.bonusBanner}>
//                       <View style={styles.bonusBannerContent}>
//                         <View style={styles.bonusIconContainer}>
//                         </View>
//                         <View>
//                           <Text style={styles.bonusTitle}>
//                             <Icon name="gift" size={16} color="#f59e0b" />{' '}
//                             First Purchase Bonus 30 Days FREE!
//                           </Text>
//                           <Text style={styles.bonusText}>
//                             Buy any plan now and get{' '}
//                             <Text style={styles.bonusBold}>30 extra days FREE</Text> — pay for 30 days, get 60 days!
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                   )}

//                   <TouchableOpacity
//                     style={styles.getStartedButton}
//                     onPress={() => setShowPlanModal(true)}
//                   >
//                     <Text style={styles.getStartedButtonText}>Choose a Plan & Get Started →</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {/* ===== PAYMENT RECEIPT ===== */}
//             {subscription?.lastPaymentId && (
//               <View style={styles.receiptCard}>
//                 <View style={styles.receiptHeader}>
//                   <Text style={styles.receiptTitle}>✓ Last Payment</Text>
//                   <TouchableOpacity
//                     style={styles.downloadButton}
//                     onPress={() => downloadReceipt(subscription.lastPaymentId)}
//                   >
//                     <Text style={styles.downloadButtonText}>📥 Download Receipt</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <View style={styles.receiptInfo}>
//                   <View style={styles.receiptItem}>
//                     <Text style={styles.receiptLabel}>Transaction ID</Text>
//                     <Text style={styles.receiptValue}>
//                       {subscription.lastPaymentId.length > 20 ? subscription.lastPaymentId.substring(0, 20) + '...' : subscription.lastPaymentId}
//                     </Text>
//                   </View>
//                   <View style={styles.receiptItem}>
//                     <Text style={styles.receiptLabel}>Amount Paid</Text>
//                     <Text style={styles.receiptValueLarge}>₹{subscription.lastPaymentAmount}</Text>
//                   </View>
//                   <View style={styles.receiptItem}>
//                     <Text style={styles.receiptLabel}>Payment Date</Text>
//                     <Text style={styles.receiptValue}>{formatDate(subscription.lastPaymentDate)}</Text>
//                   </View>
//                   <View style={styles.receiptItem}>
//                     <Text style={styles.receiptLabel}>Status</Text>
//                     <View style={styles.paidBadge}>
//                       <Text style={styles.paidBadgeText}>✓ PAID</Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>

//         {/* ===== PLAN SELECTION MODAL WITH SCROLLABLE CONTENT ===== */}
//         <Modal
//           visible={showPlanModal}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setShowPlanModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <View>
//                   <Text style={styles.modalTitle}>Choose Your Plan</Text>
//                   <Text style={styles.modalSubtitle}>
//                     {!bonusUsed
//                       ? '🎁 Get 30 days FREE bonus with your first purchase!'
//                       : 'Select a plan — 30 days per purchase, no auto-renewal'
//                     }
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => { setShowPlanModal(false); setError(''); }}
//                   style={styles.closeButton}
//                 >
//                   <Text style={styles.closeButtonText}>✕</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Single ScrollView for all modal content */}
//               <ScrollView 
//                 style={styles.modalScrollView} 
//                 showsVerticalScrollIndicator={true}
//                 contentContainerStyle={styles.modalScrollContent}
//               >
//                 {/* Bonus Banner */}
//                {!bonusUsed && (
//   <View style={styles.modalBonusBanner}>
//     <View style={styles.modalBonusContent}>
//       <View style={styles.modalBonusIcon}>
//          <Text style={styles.modalBonusIconText}>⚡</Text> 
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.modalBonusTitle}>🎁 First Purchase Bonus: 30 Days FREE!</Text>
//         <Text style={styles.modalBonusText}>
//           Pay for 30 days, get <Text style={styles.modalBonusBold}>30 extra days FREE</Text> 60 days total.
//         </Text>
//         <Text style={styles.modalBonusTextSmall}>
//           This offer is available on your first paid plan only.
//         </Text>
//       </View>
//     </View>
//   </View>
// )}

//                 {/* Error */}
//                 {error && (
//                   <View style={styles.modalError}>
//                     <Text style={styles.modalErrorIcon}>⚠️</Text>
//                     <Text style={styles.modalErrorText}>{error}</Text>
//                   </View>
//                 )}

//                 {/* Plans Grid */}
//                 <View style={styles.plansGrid}>
//                   {availablePlans.map((plan) => {
//                     const isCurrentPlan = plan.id === subscription?.planKey && isActive;
//                     const planHierarchy = { free: 0, starter: 1, growth: 2, premium: 3 };
//                     const canPurchase = !isCurrentPlan && !(isActive && planHierarchy[plan.id] < planHierarchy[subscription?.planKey]);
//                     const isRenewal = plan.id === subscription?.planKey;

//                     return renderPlanCard(plan, isCurrentPlan, canPurchase, isRenewal);
//                   })}
//                 </View>

//                 {/* Info Note - Now inside ScrollView */}
//                 <View style={styles.modalInfo}>
//                   <View style={styles.modalInfoIconWrapper}>
//                     <Icon name="information-outline" size={18} color="#7C3AED" />
//                   </View>
//                   <View style={styles.modalInfoTextWrapper}>
//                     <Text style={styles.modalInfoHeading}>How it works:</Text>
//                     <Text style={styles.modalInfoDescription}>
//                       Each plan is a one-time payment for its selected term (monthly or yearly).
//                       No auto-renewal — you manually renew when you want.
//                       {!bonusUsed && ' First-time buyers get 30 extra days FREE (60 days total).'}
//                       {' '}After expiry, your profile will be downgraded to the Free plan.
//                     </Text>
//                   </View>
//                 </View>
//               </ScrollView>
//             </View>
//           </View>
//         </Modal>
        
//         <Modal
//           visible={showReceiptModal}
//           animationType="slide"
//           onRequestClose={() => setShowReceiptModal(false)}
//         >
//           <View style={styles.receiptModalContainer}>
//             <View style={styles.receiptModalHeader}>
//               <Text style={styles.receiptModalTitle}>Invoice</Text>
//               <TouchableOpacity
//                 onPress={() => setShowReceiptModal(false)}
//                 style={styles.receiptModalClose}
//               >
//                 <Icon name="close" size={24} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <WebView
//               source={{ html: receiptHTML }}
//               style={styles.webview}
//               javaScriptEnabled={true}
//               domStorageEnabled={true}
//               originWhitelist={['*']}
//             />

//             <View style={styles.receiptActionButtons}>
//               <TouchableOpacity
//                 style={styles.downloadReceiptButton}
//                 onPress={saveReceiptToDevice}
//               >
//                 <Icon name="download" size={20} color="#fff" />
//                 <Text style={styles.downloadReceiptButtonText}>Save Receipt</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.infoNote}>
//               <Icon name="information-outline" size={14} color="#6B7280" />
//               <Text style={styles.infoNoteText}>
//                 Receipt will be saved to Downloads folder
//               </Text>
//             </View>
//           </View>
//         </Modal>
//       </ScrollView>
//     </>                                                                                                     
//   );
// };

// export default VendorSubscriptionManager;
import React, { useState, useEffect } from 'react';
import { styles } from './MyPlanStyle';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Linking,
  Share,
  PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import CustomHeader from '../../components/header/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'https://api.aissignatureevent.com/api';
import RNFS from 'react-native-fs';

console.log('========== VENDOR SUBSCRIPTION MANAGER LOADED ==========');

const VendorSubscriptionManager = () => {
  console.log('🔵 Component rendered');
  
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptHTML, setReceiptHTML] = useState('');
  const [vendorToken, setVendorToken] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [logoBase64, setLogoBase64] = useState('');
  
  const availablePlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 499,
      icon: '⚡',
      color: '#3B82F6',
      features: [
        'Verified vendor badge',
        'Portfolio: Up to 15 media files',
        'Improved placement in search results',
        'Category + location SEO optimization',
        'Profile reviewed & managed by AIS team'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 999,
      icon: '📈',
      color: '#FF9800',
      popular: true,
      features: [
        'Portfolio: Up to 30 media files',
        'Everything in Starter',
        'Higher ranking in category searches',
        'Featured placement in recommended vendors',
        'Portfolio enhancement',
        'Basic social media promotion'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1499,
      icon: '👑',
      color: '#8B5CF6',
      features: [
        'Unlimited media uploads',
        'Top-tier visibility in search results',
        'Premium verified badge',
        'Social media shoutouts & promotions',
        'Dedicated profile optimization',
        'Priority placement during high-demand searches'
      ]
    }
  ];

  // Get token on component mount
  useEffect(() => {
    console.log('🟢 useEffect - getToken called');
    getToken();
  }, []);

  // Load subscription after token is available
  useEffect(() => {
    console.log('🟢 useEffect - vendorToken changed:', vendorToken ? 'Token exists' : 'No token');
    if (vendorToken) {
      loadSubscription();
    }
  }, [vendorToken]);

  const getToken = async () => {
    console.log('📱 getToken: Starting...');
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const vendorTokenStorage = await AsyncStorage.getItem('vendorToken');

      console.log('📱 authToken exists:', authToken ? 'Yes' : 'No');
      console.log('📱 vendorTokenStorage exists:', vendorTokenStorage ? 'Yes' : 'No');

      const finalToken = authToken || vendorTokenStorage;
      console.log('📱 Final token:', finalToken ? 'Token retrieved' : 'No token found');

      setVendorToken(finalToken);

      if (!finalToken) {
        console.log('❌ No token found!');
        setError('No authentication token found. Please login again.');
        setLoading(false);
      }
    } catch (error) {
      console.log('❌ Error getting token:', error);
      setError('Failed to authenticate. Please login again.');
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    console.log('🔄 loadSubscription: Starting...');
    if (!vendorToken) {
      console.log('❌ loadSubscription: No vendor token');
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('🔄 Fetching subscription status...');
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('🔄 Subscription response:', data);
      
      if (data.success) {
        console.log('✅ Subscription loaded:', data.subscription);
        setSubscription(data.subscription);
      } else {
        console.log('❌ Subscription load failed:', data.message);
        setError(data.message || 'Failed to load subscription');
      }
    } catch (err) {
      console.error('❌ Error loading subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (planKey) => {
    console.log(`💳 initiatePayment called with planKey: ${planKey}`);
    
    if (!vendorToken) {
      console.log('❌ No vendor token, cannot proceed');
      Alert.alert('Error', 'Please login again to continue');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      console.log('1. Creating order for plan:', planKey);

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

      const options = {
        key: 'rzp_live_SQbIdkWnB4MDHg',
        amount: amountInPaise,
        currency: 'INR',
        name: 'AIS Signature',
        description: data.planName,
        order_id: data.orderId,

        prefill: {
          name: subscription?.vendorName || 'Test User',
          email: subscription?.vendorEmail || 'test@razorpay.com',
          contact: subscription?.vendorPhone || '9999999999'
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
            console.log('Modal dismissed');
            setPurchasing(false);
            if (currentOrderId) cancelOrder(currentOrderId);
          }
        }
      };

      console.log('3. Opening Razorpay with options:', options);

      RazorpayCheckout.open(options)
        .then(async (paymentResponse) => {
          console.log('4. Payment success:', paymentResponse);
          await verifyPayment(paymentResponse, planKey, data.orderId);
        })
        .catch((error) => {
          console.log('5. Payment failed:', error);
          setPurchasing(false);
          if (currentOrderId) cancelOrder(currentOrderId);
        });

    } catch (err) {
      console.log('❌ Error in initiatePayment:', err);
      setError(err.message);
      setPurchasing(false);
      Alert.alert('Error', err.message);
    }
  };

  const handlePurchase = (planKey) => {
    console.log(`🛒 handlePurchase called with planKey: ${planKey}`);
    console.log(`🛒 vendorToken exists: ${!!vendorToken}`);
    initiatePayment(planKey);
  };

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

  const verifyPayment = async (paymentResponse, planKey, orderId) => {
    console.log('🔐 Verifying payment...');
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
      console.log('Verification response:', data);
      
      if (data.success) {
        setShowPlanModal(false);
        await loadSubscription();

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
      setError(err.message || 'Failed to verify payment');
      Alert.alert('Error', err.message || 'Failed to verify payment. Please contact support with your payment ID if amount was deducted.');
    } finally {
      setPurchasing(false);
    }
  };

  const saveReceiptToDevice = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save receipts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot save receipt without storage permission.');
          return;
        }
      }

      const fileName = `Receipt_${Date.now()}.html`;
      let filePath;

      if (Platform.OS === 'android') {
        const downloadsPath = RNFS.DownloadDirectoryPath;
        filePath = `${downloadsPath}/${fileName}`;
      } else {
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      await RNFS.writeFile(filePath, receiptHTML, 'utf8');

      Alert.alert(
        'Success!',
        `Receipt saved successfully!\n\nLocation: ${filePath}`,
        [
          { text: 'OK' },
        ]
      );

    } catch (error) {
      console.log('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    }
  };

  const downloadReceipt = async (paymentId) => {
    console.log(`📄 downloadReceipt called with paymentId: ${paymentId}`);
    
    if (!paymentId) {
      Alert.alert('Error', 'No payment ID available. Please try again later.');
      return;
    }

    setPurchasing(true);

    try {
      console.log('Fetching receipt for payment ID:', paymentId);

      const response = await fetch(`${API_BASE_URL}/subscription/receipt/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Receipt response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate receipt. Payment may not be found.');
      }

      const r = data.receipt;
      const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : 'N/A';
      const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }) : '';
      const invoiceNo = `INV-${r.paymentId?.slice(-8)?.toUpperCase() || Date.now()}`;

      const logoUrl = 'https://aissignatureevent.com/AIS_LOGO_TRANS.png';

      const receiptHTMLContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>Invoice ${invoiceNo} - AIS Signature</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background: #f3f4f6;
      padding: 20px;
      font-family: -apple-system, 'Helvetica Neue', sans-serif;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      flex-wrap: wrap;
    }
    
    .brand {
      display: flex;
      width: 50%;
      min-width: 200px;
    }
    
    .logo-box {
      background: #ede9fe;
      padding: 30px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-box img {
      width: 100%;
      height: auto;
      max-height: 150px;
      object-fit: contain;
    }
    
    .invoice-meta {
      text-align: right;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color : #fff;
    }
    
    .invoice-meta h2 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: .9;
      margin-bottom: 8px;
    }
    
    .invoice-meta .invoice-number {
      font-size: 20px;
      font-weight: 700;
    }
    
    .status-badge {
      display: inline-block;
      background: #10b981;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    .content {
      padding: 30px;
    }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .party {
      padding: 20px;
      background: #f9fafb;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }
    
    .party h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      margin-bottom: 12px;
    }
    
    .party .name {
      font-weight: 600;
      font-size: 15px;
      color: #111827;
    }
    
    .table-container {
      margin-bottom: 30px;
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 1.3fr 1.3fr 1fr 1fr;
      background: #f3f4f6;
      padding: 9px;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      padding: 9px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 9px;
    }
    
    .summary {
      background: #f9fafb;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-row.total {
      border-top: 2px solid #4F46E5;
      margin-top: 10px;
      padding-top: 15px;
    }
    
    .payment-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 30px;
    }
    
    .payment-item {
      padding: 15px;
      background: #f9fafb;
      border-radius: 10px;
      text-align: center;
    }
    
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .print-btn-container {
      padding: 20px 30px;
      background: #fff;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .print-btn {
      display: inline-block;
      background: #4F46E5;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      border: none;
      margin: 0 10px;
    }
    
    .print-btn:hover {
      background: #4338CA;
    }
    
    @media print {
      .print-btn-container {
        display: none;
      }
      body {
        padding: 0;
        background: white;
      }
      .invoice-container {
        box-shadow: none;
      }
    }
    
    @media (max-width: 600px) {
      .header {
        flex-direction: column;
      }
      .brand {
        width: 100%;
      }
      .invoice-meta {
        text-align: left;
        padding: 20px;
      }
      .parties {
        grid-template-columns: 1fr;
      }
      .payment-info {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="brand">
        <div class="logo-box">
          <img src="${logoUrl}" alt="AIS Signature" />
        </div>
      </div>
      <div class="invoice-meta">
        <h2>Tax Invoice</h2>
        <div class="invoice-number">${invoiceNo}</div>
        <div class="invoice-date">${formatDate(r.date)} at ${formatTime(r.date)}</div>
        <div class="status-badge">✓ PAID</div>
      </div>
    </div>
    
    <div class="content">
      <div class="parties">
        <div class="party">
          <h3>From</h3>
          <p class="name">ORBOSIS VIBEZ EVENT & MARKETING PRIVATE LIMITED</p>
          <p>info@aissignatureevent.com</p>
        </div>
        <div class="party">
          <h3>Bill To</h3>
          <p class="name">${r.vendorName || 'Vendor'}</p>
          <p>${r.vendorEmail || 'N/A'}</p>
        </div>
      </div>
      
      <div class="table-container">
        <div class="table-header">
          <span>Description</span>
          <span>Duration</span>
          <span>Type</span>
          <span>Amount</span>
        </div>
        <div class="table-row">
          <div>
            <div class="plan-name">${r.planName || 'Subscription Plan'}</div>
            <div>Plan: ${r.planKey || 'N/A'}</div>
          </div>                
          <div>${r.durationDays || 30} days${r.bonusDays ? ' +' + r.bonusDays + ' bonus' : ''}</div>
          <div>${r.type || 'Purchase'}</div>
          <div style="text-align:right">₹${(r.amount || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-row"><span>Subtotal</span><span>₹${(r.amount || 0).toLocaleString('en-IN')}</span></div>
        <div class="summary-row"><span>Tax</span><span>₹0.00</span></div>
        <div class="summary-row total"><span>Total Amount</span><span>₹${(r.amount || 0).toLocaleString('en-IN')}</span></div>
      </div>
      
      <div class="payment-info">
        <div class="payment-item">
          <div class="label">Payment ID</div>
          <div class="value">${r.paymentId || 'N/A'}</div>
        </div>
        <div class="payment-item">
          <div class="label">Order ID</div>
          <div class="value">${r.orderId || 'N/A'}</div>
        </div>
        <div class="payment-item">
          <div class="label">Payment Method</div>
          <div class="value">Razorpay</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Thank you for choosing ORBOSIS VIBEZ EVENT & MARKETING PRIVATE LIMITED!</p>
      <p style="font-size: 11px; margin-top: 10px;">This is a computer-generated invoice.</p>
    </div>
    
    <div class="print-btn-container">
      <button class="print-btn" onclick="window.print();">🖨️ Print / Save as PDF</button>
    </div>
  </div>
  
  <script>
    if (window.location.search.includes('print=true')) {
      setTimeout(() => window.print(), 500);
    }
  </script>
</body>
</html>`;

      setReceiptHTML(receiptHTMLContent);
      setShowReceiptModal(true);

    } catch (err) {
      console.error('Download receipt error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to download receipt. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const renderPlanCard = (plan, isCurrentPlan = false, canPurchase = true, isRenewal = false) => {
    const totalDays = !subscription?.firstPaidBonusUsed ? 60 : 30;
    
    // CONSOLE LOGS FOR EACH PLAN CARD
    console.log(`========== ${plan.name} PLAN CARD RENDER ==========`);
    console.log(`Plan ID: ${plan.id}`);
    console.log(`Plan Price: ₹${plan.price}`);
    console.log(`isCurrentPlan: ${isCurrentPlan}`);
    console.log(`canPurchase: ${canPurchase}`);
    console.log(`isRenewal: ${isRenewal}`);
    console.log(`purchasing state: ${purchasing}`);
    console.log(`Button enabled: ${canPurchase && !purchasing}`);
    console.log(`==================================================`);

    return (
      <View key={plan.id} style={[
        styles.planCard,
        plan.popular && styles.popularPlanCard,
        isCurrentPlan && styles.currentPlanCard
      ]}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
          </View>
        )}

        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>✓ YOUR PLAN</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIconContainer, { backgroundColor: plan.color }]}>
            <Text style={styles.planIconText}>{plan.icon}</Text>
          </View>
          <Text style={[styles.planName, plan.popular && styles.planNameLight]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, plan.popular && styles.priceLight]}>
              ₹{plan.price}
            </Text>
            <Text style={[styles.priceDuration, plan.popular && styles.priceDurationLight]}>
              /30 days
            </Text>
          </View>

          {!subscription?.firstPaidBonusUsed && canPurchase && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusBadgeText}>🎁 Get {totalDays} days (30 + 30 FREE)</Text>
            </View>
          )}
        </View>

        <View style={styles.featuresList}>
          {plan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={[styles.featureText, plan.popular && styles.featureTextLight]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            isCurrentPlan && styles.currentPlanButton,
            (!canPurchase || purchasing) && styles.disabledButton,
            (plan.id === 'growth' || plan.name === 'Growth') && !isCurrentPlan && styles.growthPlanButton,
          ]}
          onPress={() => {
            console.log(`🔘🔘🔘 ${plan.name} BUTTON PRESSED! 🔘🔘🔘`);
            console.log(`canPurchase value: ${canPurchase}`);
            console.log(`purchasing value: ${purchasing}`);
            console.log(`Will call handlePurchase: ${canPurchase && !purchasing}`);
            
            if (canPurchase && !purchasing) {
              console.log(`✅ Proceeding to handlePurchase for ${plan.name} (${plan.id})`);
              handlePurchase(plan.id);
            } else {
              console.log(`❌ Button click ignored. canPurchase: ${canPurchase}, purchasing: ${purchasing}`);
              if (!canPurchase) {
                console.log(`Reason: canPurchase is false`);
                Alert.alert('Not Available', `You cannot switch to ${plan.name} plan at this time.`);
              }
              if (purchasing) {
                console.log(`Reason: Already purchasing`);
              }
            }
          }}
          disabled={!canPurchase || purchasing}
        >
          <Text style={[
            styles.purchaseButtonText,
            (!canPurchase || purchasing) && styles.disabledButtonText,
            (plan.id === 'growth' || plan.name === 'Growth') && !isCurrentPlan && styles.growthPlanButtonText,
          ]}>
            {purchasing ? 'Processing...' :
              isCurrentPlan ? 'Current Plan' :
                isRenewal ? `Renew — ₹${plan.price}` :
                  !subscription?.firstPaidBonusUsed ? `Get ${totalDays} Days — ₹${plan.price}` :
                    `Buy — ₹${plan.price}`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    console.log('⏳ Loading state...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (error && !subscription) {
    console.log('❌ Error state:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  const isActive = subscription?.isActive;
  const isExpired = subscription?.isExpired;
  const isFree = subscription?.isFree;
  const daysRemaining = subscription?.daysRemaining || 0;
  const currentPlan = availablePlans.find(p => p.id === subscription?.planKey);
  const bonusUsed = subscription?.firstPaidBonusUsed;

  console.log('========== CURRENT SUBSCRIPTION STATE ==========');
  console.log('isActive:', isActive);
  console.log('isExpired:', isExpired);
  console.log('isFree:', isFree);
  console.log('daysRemaining:', daysRemaining);
  console.log('currentPlan:', currentPlan);
  console.log('bonusUsed:', bonusUsed);
  console.log('subscription?.planKey:', subscription?.planKey);
  console.log('================================================');

  return (
    <>
      <CustomHeader />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Header */}
          <LinearGradient
            colors={['#4F46E5', '#D946EF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View>
                <View style={styles.headerTitleRow}>
                  <Icon name="crown" size={22} color="#fff" />
                  <Text style={styles.headerTitle}>My Plan</Text>
                </View>

                <Text style={styles.headerSubtitle}>
                  Manage your subscription and billing
                </Text>
              </View>

              <View style={[
                styles.statusBadge,
                isActive && styles.statusActive,
                isExpired && styles.statusExpired,
                isFree && styles.statusFree
              ]}>
                <Text style={styles.statusText}>
                  {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'FREE PLAN'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* ===== ACTIVE PAID PLAN ===== */}
            {isActive && currentPlan && (
              <>
                <View style={[
                  styles.countdownBanner,
                  daysRemaining <= 7 && styles.countdownBannerWarning
                ]}>
                  <View style={styles.countdownDays}>
                    <Text style={styles.countdownDaysText}>
                      {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>
                  <View style={styles.countdownContent}>
                    <View style={styles.countdownTextContainer}>
                      <Text style={styles.countdownTitle}>
                        {daysRemaining <= 7 ? '⚠️ Plan Expiring Soon!' : `${subscription.planName} Plan Active`}
                      </Text>
                      <Text style={styles.countdownDescription}>
                        {daysRemaining <= 7
                          ? `Your ${subscription.planName} plan expires on ${formatDate(subscription.expiryDate)}. Renew now to keep all your features.`
                          : `You have ${daysRemaining} days remaining. Plan expires on ${formatDate(subscription.expiryDate)}.`
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.currentPlanDetails}>
                  <View style={styles.currentPlanHeader}>
                    <Text style={styles.currentPlanTitle}>
                      Current Plan — {subscription.planName}
                    </Text>
                    <Text style={styles.currentPlanSubtitle}>One-time purchase · No auto-renewal</Text>
                  </View>
                  <View style={styles.currentPlanInfo}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Plan</Text>
                      <Text style={styles.infoValue}>{subscription.planName}</Text>
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>✓ Active</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Amount Paid</Text>
                      <Text style={styles.infoValueLarge}>₹{subscription.lastPaymentAmount}</Text>
                      <Text style={styles.infoSmall}>One-time payment</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Start Date</Text>
                      <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
                      <Text style={styles.infoSmall}>Activation date</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Expiry Date</Text>
                      <Text style={[styles.infoValue, daysRemaining <= 7 && styles.expiryWarning]}>
                        {formatDate(subscription.expiryDate)}
                      </Text>
                      <Text style={styles.infoSmall}>{daysRemaining} days remaining</Text>
                    </View>
                  </View>

                  <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Active Features:</Text>
                    <View style={styles.featuresGrid}>
                      {currentPlan.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureGridItem}>
                          <Text style={styles.featureGridCheck}>✓</Text>
                          <Text style={styles.featureGridText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.warningNotice}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <View>
                      <Text style={styles.warningTitle}>No Auto-Renewal</Text>
                      <Text style={styles.warningText}>
                        Your plan will expire on <Text style={styles.warningBold}>{formatDate(subscription.expiryDate)}</Text>.
                        After expiry, your profile will be downgraded to the Free plan.
                        You can renew or upgrade anytime before or after expiry.
                      </Text>
                    </View>
                  </View>
                </View>

                {subscription.hasUpcomingPlan && subscription.upcomingPlan && (
                  <View style={styles.upcomingPlanBanner}>
                    <View style={styles.upcomingPlanContent}>
                      <Text style={styles.upcomingPlanIcon}>⏰</Text>
                      <View style={styles.upcomingPlanTextContainer}>
                        <View style={styles.upcomingPlanHeader}>
                          <Text style={styles.upcomingPlanTitle}>🎉 Upcoming Plan Queued</Text>
                          <View style={styles.upcomingPlanBadge}>
                            <Text style={styles.upcomingPlanBadgeText}>PAID</Text>
                          </View>
                        </View>
                        <Text style={styles.upcomingPlanDescription}>
                          Your <Text style={styles.upcomingPlanBold}>{subscription.upcomingPlan.planName}</Text>
                          plan (₹{subscription.upcomingPlan.amount}) is queued and will
                          automatically activate on <Text style={styles.upcomingPlanBold}>{new Date(subscription.upcomingPlan.scheduledStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> when
                          your current plan expires.
                        </Text>
                        <View style={styles.upcomingPlanDuration}>
                          <Text style={styles.upcomingPlanDurationText}>
                            📅 Duration: {subscription.upcomingPlan.totalDays} days
                            {subscription.upcomingPlan.bonusDays > 0 && ` (includes ${subscription.upcomingPlan.bonusDays} bonus)`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {!subscription.hasUpcomingPlan && (
                  <View style={styles.actionBanner}>
                    <View>
                      <Text style={styles.actionTitle}>
                        {daysRemaining <= 7 ? '⚠️ Renew Before Expiry!' : 'Renew or Change Plan'}
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        {daysRemaining <= 7
                          ? 'Your plan is about to expire. Renew now to avoid losing features.'
                          : 'Extend your plan or change to a different plan to suit your needs.'
                        }
                      </Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.renewButton}
                        onPress={() => {
                          console.log('🔄 Renew button pressed');
                          handlePurchase(subscription.planKey);
                        }}
                        disabled={purchasing}
                      >
                        <Text style={styles.renewButtonText}>
                          Renew ₹{subscription.lastPaymentAmount}
                        </Text>
                      </TouchableOpacity>

                      {subscription.planKey === 'premium' ? (
                        <TouchableOpacity
                          style={styles.changePlanButton}
                          onPress={() => {
                            console.log('📱 Change Plan button pressed - Opening modal');
                            setShowPlanModal(true);
                          }}
                        >
                          <Text style={styles.changePlanButtonText}>Change Plan</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.upgradeButton}
                          onPress={() => {
                            console.log('📱 Upgrade button pressed - Opening modal');
                            setShowPlanModal(true);
                          }}
                        >
                          <Text style={styles.upgradeButtonText}>Upgrade</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}

            {/* ===== EXPIRED PLAN ===== */}
            {isExpired && (
              <>
                <View style={styles.expiredBanner}>
                  <View style={styles.expiredContent}>
                    <Text style={styles.expiredIcon}>⚠️</Text>
                    <View>
                      <Text style={styles.expiredTitle}>⏰ Plan Expired</Text>
                      <Text style={styles.expiredDescription}>
                        Your <Text style={styles.expiredBold}>{subscription.planName}</Text> plan expired on <Text style={styles.expiredBold}>{formatDate(subscription.expiryDate)}</Text>.
                        Your profile has been downgraded to the Free plan. Renew or choose a new plan to restore all features.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.expiredPlanCard}>
                  <View style={styles.expiredPlanHeader}>
                    <Text style={styles.expiredPlanTitle}>⚠️ Previous Plan — {subscription.planName} (Expired)</Text>
                  </View>
                  <View style={styles.expiredPlanInfo}>
                    <View>
                      <Text style={styles.infoLabel}>Plan</Text>
                      <Text style={styles.infoValue}>{subscription.planName}</Text>
                      <View style={styles.expiredBadge}>
                        <Text style={styles.expiredBadgeText}>Expired</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Was Active From</Text>
                      <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>Expired On</Text>
                      <Text style={[styles.infoValue, styles.expiredText]}>{formatDate(subscription.expiryDate)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reactivateBanner}>
                  <View>
                    <Text style={styles.reactivateTitle}>Reactivate Your Plan</Text>
                    <Text style={styles.reactivateSubtitle}>Choose a plan to restore all your features and visibility</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reactivateButton}
                    onPress={() => {
                      console.log('📱 Reactivate button pressed - Opening modal');
                      setShowPlanModal(true);
                    }}
                  >
                    <Text style={styles.reactivateButtonText}>Choose a Plan →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ===== FREE PLAN ===== */}
            {isFree && !isExpired && (
              <View style={styles.freePlanCard}>
                <View style={styles.freePlanHeader}>
                  <Text style={styles.freePlanTitle}>
                    <Icon name="alert-circle" size={20} color="#bdbdbc" /> Free Plan — Unlisted Vendor
                  </Text>
                </View>
                <View style={styles.freePlanContent}>
                  <View style={styles.freePlanIconContainer}>
                    <Icon name="crown" size={20} color="#FFD700" style={styles.freePlanIcon} />
                  </View>
                  <Text style={styles.freePlanName}>Free Plan</Text>
                  <Text style={styles.freePlanDescription}>Entry-level presence with organic discovery</Text>

                  <View style={styles.includedFeatures}>
                    <Text style={styles.includedTitle}>✓ Included:</Text>
                    {['Platform registration', 'Service & city listing', 'Portfolio: Up to 5 images (no videos)', 'Appears in general search results', 'Discoverable via category & location'].map((f, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.featureRowText}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.excludedFeatures}>
                    <Text style={styles.excludedTitle}>✗ Not Included:</Text>
                    {['Verified badge', 'Priority visibility', 'Marketing push'].map((f, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Text style={styles.xIcon}>✗</Text>
                        <Text style={styles.featureRowTextExcluded}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  {!bonusUsed && (
                    <View style={styles.bonusBanner}>
                      <View style={styles.bonusBannerContent}>
                        <View style={styles.bonusIconContainer}>
                        </View>
                        <View>
                          <Text style={styles.bonusTitle}>
                            <Icon name="gift" size={16} color="#f59e0b" />{' '}
                            First Purchase Bonus 30 Days FREE!
                          </Text>
                          <Text style={styles.bonusText}>
                            Buy any plan now and get{' '}
                            <Text style={styles.bonusBold}>30 extra days FREE</Text> — pay for 30 days, get 60 days!
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={() => {
                      console.log('📱 Get Started button pressed - Opening modal');
                      setShowPlanModal(true);
                    }}
                  >
                    <Text style={styles.getStartedButtonText}>Choose a Plan & Get Started →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ===== PAYMENT RECEIPT ===== */}
            {subscription?.lastPaymentId && (
              <View style={styles.receiptCard}>
                <View style={styles.receiptHeader}>
                  <Text style={styles.receiptTitle}>✓ Last Payment</Text>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => {
                      console.log('📄 Download receipt button pressed');
                      downloadReceipt(subscription.lastPaymentId);
                    }}
                  >
                    <Text style={styles.downloadButtonText}>📥 Download Receipt</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.receiptInfo}>
                  <View style={styles.receiptItem}>
                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                    <Text style={styles.receiptValue}>
                      {subscription.lastPaymentId.length > 20 ? subscription.lastPaymentId.substring(0, 20) + '...' : subscription.lastPaymentId}
                    </Text>
                  </View>
                  <View style={styles.receiptItem}>
                    <Text style={styles.receiptLabel}>Amount Paid</Text>
                    <Text style={styles.receiptValueLarge}>₹{subscription.lastPaymentAmount}</Text>
                  </View>
                  <View style={styles.receiptItem}>
                    <Text style={styles.receiptLabel}>Payment Date</Text>
                    <Text style={styles.receiptValue}>{formatDate(subscription.lastPaymentDate)}</Text>
                  </View>
                  <View style={styles.receiptItem}>
                    <Text style={styles.receiptLabel}>Status</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>✓ PAID</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ===== PLAN SELECTION MODAL WITH SCROLLABLE CONTENT ===== */}
        <Modal
          visible={showPlanModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            console.log('Modal closed');
            setShowPlanModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Choose Your Plan</Text>
                  <Text style={styles.modalSubtitle}>
                    {!bonusUsed
                      ? '🎁 Get 30 days FREE bonus with your first purchase!'
                      : 'Select a plan — 30 days per purchase, no auto-renewal'
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => { 
                    console.log('Close button pressed');
                    setShowPlanModal(false); 
                    setError(''); 
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Single ScrollView for all modal content */}
              <ScrollView 
                style={styles.modalScrollView} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Bonus Banner */}
               {!bonusUsed && (
  <View style={styles.modalBonusBanner}>
    <View style={styles.modalBonusContent}>
      <View style={styles.modalBonusIcon}>
         <Text style={styles.modalBonusIconText}>⚡</Text> 
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modalBonusTitle}>🎁 First Purchase Bonus: 30 Days FREE!</Text>
        <Text style={styles.modalBonusText}>
          Pay for 30 days, get <Text style={styles.modalBonusBold}>30 extra days FREE</Text> 60 days total.
        </Text>
        <Text style={styles.modalBonusTextSmall}>
          This offer is available on your first paid plan only.
        </Text>
      </View>
    </View>
  </View>
)}

                {/* Error */}
                {error && (
                  <View style={styles.modalError}>
                    <Text style={styles.modalErrorIcon}>⚠️</Text>
                    <Text style={styles.modalErrorText}>{error}</Text>
                  </View>
                )}

                {/* Plans Grid - FIXED canPurchase logic */}
                <View style={styles.plansGrid}>
                  {availablePlans.map((plan) => {
                    const isCurrentPlan = plan.id === subscription?.planKey && isActive;
                    // FIX: Allow all plans except current plan
                    const canPurchase = !isCurrentPlan;
                    const isRenewal = plan.id === subscription?.planKey;
                    
                    console.log(`📋 MODAL: ${plan.name} - isCurrentPlan: ${isCurrentPlan}, canPurchase: ${canPurchase}, isRenewal: ${isRenewal}`);
                    
                    return renderPlanCard(plan, isCurrentPlan, canPurchase, isRenewal);
                  })}
                </View>

                {/* Info Note - Now inside ScrollView */}
                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoIconWrapper}>
                    <Icon name="information-outline" size={18} color="#7C3AED" />
                  </View>
                  <View style={styles.modalInfoTextWrapper}>
                    <Text style={styles.modalInfoHeading}>How it works:</Text>
                    <Text style={styles.modalInfoDescription}>
                      Each plan is a one-time payment for its selected term (monthly or yearly).
                      No auto-renewal — you manually renew when you want.
                      {!bonusUsed && ' First-time buyers get 30 extra days FREE (60 days total).'}
                      {' '}After expiry, your profile will be downgraded to the Free plan.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        <Modal
          visible={showReceiptModal}
          animationType="slide"
          onRequestClose={() => {
            console.log('Receipt modal closed');
            setShowReceiptModal(false);
          }}
        >
          <View style={styles.receiptModalContainer}>
            <View style={styles.receiptModalHeader}>
              <Text style={styles.receiptModalTitle}>Invoice</Text>
              <TouchableOpacity
                onPress={() => setShowReceiptModal(false)}
                style={styles.receiptModalClose}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <WebView
              source={{ html: receiptHTML }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
            />

            <View style={styles.receiptActionButtons}>
              <TouchableOpacity
                style={styles.downloadReceiptButton}
                onPress={saveReceiptToDevice}
              >
                <Icon name="download" size={20} color="#fff" />
                <Text style={styles.downloadReceiptButtonText}>Save Receipt</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoNote}>
              <Icon name="information-outline" size={14} color="#6B7280" />
              <Text style={styles.infoNoteText}>
                Receipt will be saved to Downloads folder
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>                                                                                                     
  );
};

export default VendorSubscriptionManager;