import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  PermissionsAndroid
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import CustomHeader from '../../components/header/CustomHeader';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

/**
 * PaymentHistory Component
 * Displays all payment transactions for vendor with pagination
 */
const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptHTML, setReceiptHTML] = useState('');
  const [vendorToken, setVendorToken] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentPayments, setCurrentPayments] = useState([]);

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (vendorToken) {
      fetchPaymentHistory();
    }
  }, [vendorToken]);

  useEffect(() => {
    if (paymentData?.paymentHistory) {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = paymentData.paymentHistory.slice(indexOfFirstItem, indexOfLastItem);
      setCurrentPayments(currentItems);
    }
  }, [paymentData, currentPage, itemsPerPage]);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const authToken = await AsyncStorage.getItem('authToken');
      const finalToken = token || authToken;
      setVendorToken(finalToken);
      
      if (!finalToken) {
        setError('Not authenticated');
        setLoading(false);
      }
    } catch (err) {
      console.error('Token error:', err);
      setError('Failed to authenticate');
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!vendorToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/subscription/payment-history`, {
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch payment history');
      }

      setPaymentData(data.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Payment history fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveReceiptToDevice = async () => {
    try {
      setGeneratingReceipt(true);
      
      // Request storage permission for Android
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
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
        } else {
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
      }

      const fileName = `Receipt_${Date.now()}.html`;
      let filePath;

      if (Platform.OS === 'android') {
        const downloadsPath = RNFS.DownloadDirectoryPath;
        filePath = `${downloadsPath}/${fileName}`;
      } else {
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      // Write the HTML file
      await RNFS.writeFile(filePath, receiptHTML, 'utf8');

      Alert.alert(
        'Success!',
        `Receipt saved successfully as HTML!\n\nLocation: ${filePath}\n\n`,
        [
          { text: 'OK' },
        ]
      );
      
      setShowReceiptModal(false);
    } catch (error) {
      console.log('Error saving receipt:', error);
      Alert.alert('Error', 'Failed to save receipt. Please try again.');
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const shareReceipt = async (filePath) => {
    try {
      await Share.share({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        title: 'Payment Receipt',
        message: 'Please find attached your payment receipt',
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share error:', error);
        Alert.alert('Error', 'Failed to share receipt');
      }
    }
  };

  const downloadReceipt = async (paymentId) => {
    if (!paymentId) {
      Alert.alert('Error', 'No payment ID available. Please try again later.');
      return;
    }

    setGeneratingReceipt(true);

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
    
    /* Print and PDF button styles */
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
      setGeneratingReceipt(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { bg: '#D1FAE5', color: '#065F46', icon: 'check-circle', text: 'Success' },
      failed: { bg: '#FEE2E2', color: '#991B1B', icon: 'x-circle', text: 'Failed' },
      refunded: { bg: '#FEF3C7', color: '#92400E', icon: 'refresh-cw', text: 'Refunded' }
    };

    const config = statusConfig[status] || { bg: '#F3F4F6', color: '#374151', icon: 'clock', text: status };

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <FeatherIcon name={config.icon} size={12} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      registration: { bg: '#DBEAFE', color: '#1E40AF', icon: 'credit-card', text: 'Registration' },
      upgrade: { bg: '#F3E8FF', color: '#6B21A5', icon: 'trending-up', text: 'Upgrade' },
      renewal: { bg: '#E0E7FF', color: '#1E3A8A', icon: 'refresh-cw', text: 'Renewal' }
    };

    const config = typeConfig[type] || { bg: '#F3F4F6', color: '#374151', icon: 'tag', text: type };

    return (
      <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
        <FeatherIcon name={config.icon} size={12} color={config.color} />
        <Text style={[styles.typeText, { color: config.color }]}>{config.text}</Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(paymentData?.paymentHistory?.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const SummaryCard = ({ title, value, icon, gradientColors, valuePrefix = '' }) => (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={styles.summaryCardContent}>
        <View style={styles.summaryIconContainer}>
          <MaterialIcon name={icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.summaryCardTitle}>{title}</Text>
        <Text style={styles.summaryCardValue}>
          {valuePrefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </Text>
      </View>
    </LinearGradient>
  );

  const PaymentItem = ({ payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentCardHeader}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <FeatherIcon name="calendar" size={14} color="#6B7280" />
            <Text style={styles.paymentDate}>{formatDate(payment.paymentDate)}</Text>
          </View>
          <Text style={styles.paymentTime}>{formatTime(payment.paymentDate)}</Text>
        </View>
        <View style={styles.badgeContainer}>
          {getTypeBadge(payment.type)}
          {getStatusBadge(payment.status)}
        </View>
      </View>

      <View style={styles.paymentCardBody}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{payment.planName}</Text>
          <Text style={styles.planKey}>Plan ID: {payment.planKey?.toUpperCase() || 'N/A'}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>₹{payment.amount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.paymentDetailItem}>
          <FeatherIcon name="hash" size={12} color="#9CA3AF" />
          <Text style={styles.paymentDetailLabel}>Payment ID:</Text>
          <Text style={styles.paymentDetailValue}>{payment.paymentId?.substring(0, 16)}...</Text>
        </View>
        {payment.orderId && (
          <View style={styles.paymentDetailItem}>
            <FeatherIcon name="shopping-bag" size={12} color="#9CA3AF" />
            <Text style={styles.paymentDetailLabel}>Order ID:</Text>
            <Text style={styles.paymentDetailValue}>{payment.orderId?.substring(0, 16)}...</Text>
          </View>
        )}
      </View>

      {payment.status === 'success' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => downloadReceipt(payment.paymentId)}
            style={styles.actionButton}
            disabled={generatingReceipt}
          >
            <FeatherIcon name="download" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CustomHeader />
        <View style={styles.errorContainer}>
          <FeatherIcon name="x-circle" size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Failed to load payment history</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={fetchPaymentHistory} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (!paymentData || paymentData.paymentHistory?.length === 0) {
    return (
      <>
        <CustomHeader />
        <View style={styles.emptyContainer}>
          <MaterialIcon name="receipt" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Payment History</Text>
          <Text style={styles.emptyMessage}>You haven't made any payments yet</Text>
        </View>
      </>
    );
  }

  const totalPages = Math.ceil(paymentData.paymentHistory.length / itemsPerPage);
  const startCount = (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, paymentData.paymentHistory.length);

  return (
    <>
      <CustomHeader />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <SummaryCard
              title="Total Payments"
              value={paymentData.totalPayments}
              icon="file-document-outline"
              gradientColors={['#667EEA', '#5A67D8']}
            />

            <SummaryCard
              title="Total Amount"
              value={`₹${paymentData.totalAmountPaid.toLocaleString('en-IN')}`}
              icon="currency-inr"
              gradientColors={['#48BB78', '#2F855A']}
              valuePrefix=""
            />

            <SummaryCard
              title="Business"
              value={paymentData.businessName?.substring(0, 12) || 'N/A'}
              icon="briefcase"
              gradientColors={['#ED64A6', '#D53F8C']}
            />
          </View>

          {/* Payment History Header */}
          <View style={styles.historyHeaderMain}>
            <View style={styles.historyTitleContainer}>
              <FeatherIcon name="clock" size={24} color="#4F46E5" />
              <Text style={styles.historyMainTitle}>Payment History</Text>
            </View>
            <View style={styles.historyStats}>
              <Text style={styles.historyStatsText}>
                {paymentData.paymentHistory.length} Transactions
              </Text>
            </View>
          </View>

          {/* Payment Cards */}
          {currentPayments.map((payment, index) => (
            <PaymentItem key={payment.paymentId || index} payment={payment} />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={goToPreviousPage}
                disabled={currentPage === 1}
                style={[
                  styles.paginationButton,
                  currentPage === 1 && styles.paginationButtonDisabled
                ]}
              >
                <FeatherIcon name="chevron-left" size={20} color={currentPage === 1 ? "#D1D5DB" : "#4F46E5"} />
                <Text style={[
                  styles.paginationButtonText,
                  currentPage === 1 && styles.paginationButtonTextDisabled
                ]}>Previous</Text>
              </TouchableOpacity>

              <View style={styles.paginationInfo}>
                <Text style={styles.paginationRange}>
                  {startCount} - {endCount}
                </Text>
                <Text style={styles.paginationTotal}>
                  of {paymentData.paymentHistory.length}
                </Text>
                <View style={styles.paginationPageBadge}>
                  <Text style={styles.paginationPageText}>Page {currentPage} of {totalPages}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.paginationButtonDisabled
                ]}
              >
                <Text style={[
                  styles.paginationButtonText,
                  currentPage === totalPages && styles.paginationButtonTextDisabled
                ]}>Next</Text>
                <FeatherIcon name="chevron-right" size={20} color={currentPage === totalPages ? "#D1D5DB" : "#4F46E5"} />
              </TouchableOpacity>
            </View>
          )}

          {/* Notes Section */}
          {paymentData.paymentHistory.some(p => p.notes) && (
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <FeatherIcon name="file-text" size={18} color="#4F46E5" />
                <Text style={styles.notesTitle}>Important Notes</Text>
              </View>
              {paymentData.paymentHistory
                .filter(p => p.notes)
                .slice(0, 3)
                .map((payment, index) => (
                  <View key={index} style={styles.noteItem}>
                    <View style={styles.noteHeader}>
                      <FeatherIcon name="calendar" size={12} color="#9CA3AF" />
                      <Text style={styles.noteDate}>{formatDate(payment.paymentDate)}</Text>
                    </View>
                    <Text style={styles.noteText}>{payment.notes}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Loading overlay for receipt generation */}
        {generatingReceipt && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.overlayText}>Generating receipt...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Receipt Modal - HTML Preview */}
      <Modal
        visible={showReceiptModal}
        animationType="slide"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.receiptModalContainer}>
          <View style={styles.receiptModalHeader}>
            <Text style={styles.receiptModalTitle}>Invoice Preview</Text>
            <TouchableOpacity
              onPress={() => setShowReceiptModal(false)}
              style={styles.receiptModalClose}
            >
              <FeatherIcon name="x" size={24} color="#fff" />
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
              <FeatherIcon name="save" size={20} color="#fff" />
              <Text style={styles.downloadReceiptButtonText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffff',
  },
  content: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryCardContent: {
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyHeaderMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyMainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  historyStats: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  historyStatsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  paymentTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  planKey: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  paymentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentDetailLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 4,
  },
  paymentDetailValue: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: '#D1D5DB',
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paginationTotal: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  paginationPageBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  paginationPageText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#FEFCE8',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF9C3',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#854D0E',
  },
  noteItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A16207',
  },
  noteText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginLeft: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },
  receiptModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4F46E5',
  },
  receiptModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  receiptModalClose: {
    padding: 4,
  },
  webview: {
    flex: 1,
  },
  receiptActionButtons: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  downloadReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 12,
  },
  downloadReceiptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  infoNoteText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PaymentHistory;