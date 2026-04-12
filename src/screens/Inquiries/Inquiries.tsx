import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import CustomHeader from "../../components/header/CustomHeader";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

const CustomerInquiryCard = () => {
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [acceptMessage, setAcceptMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [respondLoading, setRespondLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const statusOptions = [
    "All Status",
    "Pending",
    "Responded",
    "Close"
  ];

  // Default accept message
  const DEFAULT_ACCEPT_MSG = 'Thank you for your inquiry! We are delighted to accept your request and will reach out to you shortly to discuss the details.';

  useEffect(() => {
    loadInquiries();
  }, []);

  // Filter inquiries based on search and status
  useEffect(() => {
    let filtered = [...inquiries];
    
    // Filter by status
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(inquiry => {
        const status = inquiry.status === 'responded' ? 'Responded' :
                      inquiry.status === 'closed' ? 'Close' : 'Pending';
        return status === selectedStatus;
      });
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(inquiry =>
        inquiry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.userContact?.includes(searchTerm) ||
        inquiry.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInquiries(filtered);
  }, [inquiries, selectedStatus, searchTerm]);

  const loadInquiries = async () => {
    console.log('========== LOAD INQUIRIES START ==========');
    console.log('1. Starting to load inquiries...');
    
    setLoading(true);
    try {
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
      
      const apiUrl = `${API_BASE_URL}/vendors/dashboard/inquiries?limit=100`;
      console.log('3. Making API call to:', apiUrl);
      console.log('   - Headers:', { Authorization: `Bearer ${token.substring(0, 30)}...` });
      
      const response = await fetch(apiUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('4. API Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ API error - Status:', response.status);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('5. Response data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Success: true');
        
        const allInquiries = Array.isArray(data.data)
          ? data.data
          : (data.data?.inquiries || []);
        
        console.log('   - Total inquiries received:', allInquiries.length);
        console.log('   - Sample inquiry (first):', allInquiries[0] ? JSON.stringify(allInquiries[0], null, 2) : 'No inquiries');
        
        // Only show approved inquiries
        const approvedInquiries = allInquiries.filter(i => i.approvalStatus === 'approved');
        console.log('   - Approved inquiries count:', approvedInquiries.length);
        console.log('   - Pending approval count:', allInquiries.length - approvedInquiries.length);
        
        // Log status distribution
        const statusDistribution = {
          pending: approvedInquiries.filter(i => i.status === 'pending').length,
          responded: approvedInquiries.filter(i => i.status === 'responded').length,
          closed: approvedInquiries.filter(i => i.status === 'closed').length
        };
        console.log('   - Status distribution:', statusDistribution);
        
        setInquiries(approvedInquiries);
        setFilteredInquiries(approvedInquiries);
        
        if (approvedInquiries.length === 0 && allInquiries.length > 0) {
          console.log('⚠️ Found inquiries but none are approved yet');
          showNotification('info', `Found ${allInquiries.length} inquiries but none are approved yet`);
        } else if (approvedInquiries.length === 0) {
          console.log('ℹ️ No inquiries found');
        } else {
          console.log('✅ Inquiries loaded successfully');
        }
      } else {
        console.error('❌ API returned success=false:', data.message);
        setInquiries([]);
        setFilteredInquiries([]);
        showNotification('error', data.message || 'Failed to load inquiries');
      }
    } catch (error) {
      console.error('❌ Error fetching inquiries:', error);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      showNotification('error', 'Failed to load inquiries. Please check your connection.');
      setInquiries([]);
      setFilteredInquiries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('========== LOAD INQUIRIES END ==========');
    }
  };

  const handleAcceptInquiry = (inquiry) => {
    console.log('📝 Accept inquiry clicked for ID:', inquiry._id);
    console.log('   - User:', inquiry.userName);
    console.log('   - Event:', inquiry.eventType);
    setSelectedInquiry(inquiry);
    setAcceptMessage(DEFAULT_ACCEPT_MSG);
    setAcceptModalVisible(true);
  };

  const handleDeclineInquiry = (inquiry) => {
    console.log('📝 Decline inquiry clicked for ID:', inquiry._id);
    console.log('   - User:', inquiry.userName);
    console.log('   - Event:', inquiry.eventType);
    setSelectedInquiry(inquiry);
    setDeclineReason("");
    setDeclineModalVisible(true);
  };

  const submitVendorResponse = async (action, customMessage, reason) => {
    if (!selectedInquiry) {
      console.error('❌ No selected inquiry found');
      return;
    }
    
    console.log('========== SUBMIT VENDOR RESPONSE START ==========');
    console.log('1. Action:', action);
    console.log('2. Inquiry ID:', selectedInquiry._id);
    console.log('3. Custom Message:', customMessage ? customMessage.substring(0, 100) : 'N/A');
    console.log('4. Decline Reason:', reason || 'N/A');
    
    setRespondLoading(true);
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      
      console.log('5. Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No authentication token found');
        Alert.alert('Error', 'Authentication required');
        return;
      }
      
      const apiUrl = `${API_BASE_URL}/vendors/dashboard/inquiries/${selectedInquiry._id}/respond`;
      const requestBody = { 
        action, 
        declineReason: reason, 
        customMessage: customMessage 
      };
      
      console.log('6. API URL:', apiUrl);
      console.log('7. Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('8. Headers:', { Authorization: `Bearer ${token.substring(0, 30)}...` });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('9. Response Status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('10. Response Data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Response submitted successfully');
        
        // Update the inquiry in local state
        const updatedInquiries = inquiries.map(inquiry => {
          if (inquiry._id === selectedInquiry._id) {
            const updatedInquiry = {
              ...inquiry,
              status: 'responded',
              vendorResponse: action === 'accept' ? customMessage : reason,
              respondedAt: new Date().toISOString(),
              ...(action === 'decline' && { rejectionReason: reason })
            };
            console.log('   - Updated inquiry:', JSON.stringify(updatedInquiry, null, 2));
            return updatedInquiry;
          }
          return inquiry;
        });
        
        setInquiries(updatedInquiries);
        
        const successMessage = action === 'accept' ? 'Inquiry accepted successfully!' : 'Inquiry declined';
        console.log('✅', successMessage);
        showNotification('success', successMessage);
        
        // Close modals
        setAcceptModalVisible(false);
        setDeclineModalVisible(false);
        setSelectedInquiry(null);
        setAcceptMessage("");
        setDeclineReason("");
      } else {
        console.error('❌ API returned success=false:', data.message);
        console.error('   - Error details:', data.error);
        showNotification('error', data.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('❌ Error submitting response:', error);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      showNotification('error', 'Failed to submit response');
    } finally {
      setRespondLoading(false);
      console.log('========== SUBMIT VENDOR RESPONSE END ==========');
    }
  };

  const handleConfirmAccept = () => {
    console.log('🔍 Confirm Accept - Message length:', acceptMessage.length);
    if (!acceptMessage.trim()) {
      console.warn('⚠️ Empty accept message');
      showNotification('error', 'Response message cannot be empty');
      return;
    }
    submitVendorResponse('accept', acceptMessage, null);
  };

  const handleConfirmDecline = () => {
    console.log('🔍 Confirm Decline - Reason length:', declineReason.length);
    if (!declineReason.trim()) {
      console.warn('⚠️ Empty decline reason');
      showNotification('error', 'Please provide a reason for declining');
      return;
    }
    submitVendorResponse('decline', null, declineReason);
  };

  const onRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    loadInquiries();
  };

  const showNotification = (type, message) => {
    console.log(`📢 Notification [${type}]:`, message);
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const getInquiryStatus = (inquiry) => {
    if (inquiry.status === 'responded') {
      return { text: 'Responded', style: styles.respondedStatusBadge, textStyle: styles.respondedStatusText };
    } else if (inquiry.status === 'closed') {
      return { text: 'Closed', style: styles.closedStatusBadge, textStyle: styles.closedStatusText };
    } else {
      return { text: 'Pending', style: styles.pendingStatusBadge, textStyle: styles.pendingStatusText };
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  
  try {
    let date;
    
    // Check if it's an object with start property (eventDate object from backend)
    if (typeof dateString === 'object' && dateString.start) {
      date = new Date(dateString.start);
    } 
    // Check if it's a string
    else if (typeof dateString === 'string') {
      date = new Date(dateString);
    }
    // Check if it's already a Date object
    else if (dateString instanceof Date) {
      date = dateString;
    }
    else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Debug function to check AsyncStorage
  const debugAsyncStorage = async () => {
    console.log('========== ASYNCSTORAGE DEBUG ==========');
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const vendorId = await AsyncStorage.getItem('vendorId');
      const user = await AsyncStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('VendorId:', vendorId);
      console.log('User exists:', !!user);
      if (user) {
        console.log('User data:', JSON.parse(user));
      }
    } catch (error) {
      console.error('Storage debug error:', error);
    }
    console.log('========================================');
  };

  // Call debug on mount
  useEffect(() => {
    debugAsyncStorage();
  }, []);

  if (loading && !refreshing) {
    return (
      <>
        <CustomHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6CF7" />
          <Text style={styles.loadingText}>Loading inquiries...</Text>
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
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2F6FED"]} />
        }
      >
        <View>
          {/* Gradient Card */}
          <LinearGradient
            colors={["#8E2DE2", "#E94057"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <View style={styles.leftSection}>
              <Icon name="mail" size={26} color="#fff" style={styles.icon} />
              <View>
                <Text style={styles.title}>Customer Inquiries</Text>
                <Text style={styles.subtitle}>
                  Manage and respond to customer
                </Text>
              </View>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeNumber}>{inquiries.length}</Text>
              <Text style={styles.badgeText}>Inquiries</Text>
            </View>
          </LinearGradient>

          {/* Search & Filter Section */}
          <View style={styles.searchFilterBox}>
            <View style={styles.headerRow}>
              <Icon name="filter" size={18} color="#4F46E5" />
              <Text style={styles.sectionTitle}> Search & Filter</Text>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Icon name="search" size={18} color="#2e2e2e" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, contact, or event type..."
                  placeholderTextColor="#888"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
            </View>

            {/* Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Icon name="refresh-cw" size={16} color="#007AFF" />
              <Text style={styles.dropdownText}>{selectedStatus}</Text>
              <Icon name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Dropdown Options */}
          {showDropdown && (
            <View style={styles.dropdownList}>
              {statusOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    console.log('Filter changed to:', item);
                    setSelectedStatus(item);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notification */}
          {notification.show && (
            <View style={styles.notificationContainer}>
              <LinearGradient
                colors={notification.type === 'success' ? ['#10b779', '#059669'] : 
                        notification.type === 'error' ? ['#EF4444', '#DC2626'] : 
                        ['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.notification}
              >
                <Icon 
                  name={notification.type === 'success' ? "check-circle" : 
                        notification.type === 'error' ? "alert-circle" : "info"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.notificationText}>
                  {notification.message}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Inquiries List */}
          {filteredInquiries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No inquiries found</Text>
              <Text style={styles.emptySubText}>
                {searchTerm ? 'Try a different search term' : 'Pull down to refresh'}
              </Text>
            </View>
          ) : (
            filteredInquiries.map((inquiry) => {
              const status = getInquiryStatus(inquiry);
              const hasResponded = inquiry.status === 'responded';
              
              return (
                <View key={inquiry._id} style={styles.detailcard}>
                  {/* USER SECTION */}
                  <View style={styles.userRow}>
                    <View style={styles.avatar}>
                      <Icon name="user" size={22} color="#3B82F6" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{inquiry.userName || 'Customer'}</Text>

                      {/* PHONE */}
                      <View style={styles.contactRow}>
                        <Icon name="phone" size={14} color="#666" />
                        <Text style={styles.contactText}>{inquiry.userContact || 'N/A'}</Text>
                      </View>

                      {/* EMAIL + STATUS */}
                      <View style={styles.emailRow}>
                        <View style={styles.contactRow}>
                          <Icon name="mail" size={14} color="#666" />
                          <Text style={styles.contactText}>{inquiry.userEmail || 'N/A'}</Text>
                        </View>

                        <View style={status.style}>
                          <Text style={status.textStyle}>{status.text}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* ROW 1 */}
                  <View style={styles.infoRow}>
                    <View style={[styles.infoBox, styles.blueBox]}>
                      <Text style={styles.label}>Event Type</Text>
                      <Text style={styles.value}>{inquiry.eventType || 'Not specified'}</Text>
                    </View>

                    <View style={[styles.infoBox, styles.greenBox]}>
                      <Text style={styles.label}>Budget</Text>
                      <Text style={styles.value}>{formatCurrency(inquiry.budget)}</Text>
                    </View>
                  </View>

                  {/* ROW 2 */}
                  <View style={[styles.infoRow, { marginTop: 10 }]}>
                    <View style={[styles.infoBox, styles.purpleBox]}>
                      <Text style={styles.label}>Event Date</Text>
                      <Text style={styles.value}>{formatDate(inquiry.eventDate)}</Text>
                    </View>

                    <View style={[styles.infoBox, styles.orangeBox]}>
                      <Text style={styles.label}>City</Text>
                      <Text style={styles.value}>{inquiry.city || 'Not specified'}</Text>
                    </View>
                  </View>

                  {/* MESSAGE */}
                  <View style={styles.messageBox}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <Icon name="file-text" size={16} color="#3B5BDB" />
                      <Text style={styles.messageTitle}> Customer Message</Text>
                    </View>
                    <Text style={styles.messageText}>
                      {inquiry.message || 'No message provided'}
                    </Text>
                  </View>

                  {/* Response Message - Show when responded */}
                  {hasResponded && inquiry.vendorResponse && (
                    <View style={inquiry.rejectionReason ? styles.declinedResponseMessageBox : styles.responseMessageBox}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                        <Icon 
                          name={inquiry.rejectionReason ? "x-circle" : "check-circle"} 
                          size={16} 
                          color={inquiry.rejectionReason ? "#EF4444" : "#10b779"} 
                        />
                        <Text style={inquiry.rejectionReason ? styles.declinedResponseMessageTitle : styles.responseMessageTitle}>
                          Response Sent {inquiry.rejectionReason ? '(Declined)' : '(Accepted)'}
                        </Text>
                      </View>
                      <Text style={inquiry.rejectionReason ? styles.declinedResponseMessageText : styles.responseMessageText}>
                        {inquiry.vendorResponse}
                      </Text>
                    </View>
                  )}

                  {/* ACTION BUTTONS */}
                  <View style={styles.buttonRow}>
                    {!hasResponded ? (
                      <>
                        <TouchableOpacity 
                          style={styles.acceptButton}
                          onPress={() => handleAcceptInquiry(inquiry)}
                        >
                          <Icon name="check-circle" size={18} color="#fff" />
                          <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.declineButton}
                          onPress={() => handleDeclineInquiry(inquiry)}
                        >
                          <Icon name="x-circle" size={18} color="#fff" />
                          <Text style={styles.declineText}>Decline</Text>
                        </TouchableOpacity>
                      </>
                    ) : inquiry.rejectionReason ? (
                      <View style={styles.declinedButtonContainer}>
                        <LinearGradient
                          colors={['#EF4444', '#DC2626']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.declinedButton}
                        >
                          <Icon name="x-circle" size={18} color="#fff" />
                          <Text style={styles.declinedButtonText}>Declined</Text>
                        </LinearGradient>
                      </View>
                    ) : (
                      <View style={styles.acceptedButtonContainer}>
                        <LinearGradient
                          colors={['#10b779', '#059669']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.acceptedButton}
                        >
                          <Icon name="check-circle" size={18} color="#fff" />
                          <Text style={styles.acceptedButtonText}>Accepted</Text>
                        </LinearGradient>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Accept Inquiry Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={acceptModalVisible}
          onRequestClose={() => setAcceptModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAcceptModalVisible(false)}
          >
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#10b779', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderTitle}>Accept Inquiry</Text>
                <TouchableOpacity onPress={() => setAcceptModalVisible(false)}>
                  <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                {selectedInquiry && (
                  <>
                    <View style={styles.customerInfoCard}>
                      <Text style={styles.customerName}>{selectedInquiry.userName}</Text>
                      <Text style={styles.customerPhone}>{selectedInquiry.userContact}</Text>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventText}>Event: {selectedInquiry.eventType}</Text>
                      </View>
                    </View>

                    <View style={styles.responseSection}>
                      <Text style={styles.responseLabel}>Response to Customer</Text>
                      <Text style={styles.responseNote}>(you can edit before sending)</Text>
                      
                      <TextInput
                        style={styles.editInput}
                        value={acceptMessage}
                        onChangeText={setAcceptMessage}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholder="Type your response here..."
                      />
                    </View>

                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity 
                        style={styles.modalConfirmButton}
                        onPress={handleConfirmAccept}
                        disabled={respondLoading}
                      >
                        {respondLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Icon name="check-circle" size={18} color="#fff" />
                            <Text style={styles.modalConfirmText}>Confirm Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.modalCancelButton}
                        onPress={() => setAcceptModalVisible(false)}
                      >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Decline Inquiry Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={declineModalVisible}
          onRequestClose={() => setDeclineModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDeclineModalVisible(false)}
          >
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderTitle}>Decline Inquiry</Text>
                <TouchableOpacity onPress={() => setDeclineModalVisible(false)}>
                  <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.modalBody}>
                {selectedInquiry && (
                  <>
                    <View style={styles.customerInfoCard}>
                      <Text style={styles.customerName}>{selectedInquiry.userName}</Text>
                      <Text style={styles.customerPhone}>{selectedInquiry.userContact}</Text>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventText}>Event: {selectedInquiry.eventType}</Text>
                      </View>
                    </View>

                    <View style={styles.responseSection}>
                      <Text style={styles.responseLabel}>Response to Customer</Text>
                      <Text style={styles.responseNote}>(please provide a reason for declining)</Text>
                      
                      <TextInput
                        style={styles.declineInput}
                        placeholder="Enter reason for declining..."
                        placeholderTextColor="#9CA3AF"
                        value={declineReason}
                        onChangeText={setDeclineReason}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      <Text style={styles.defaultDeclineText}>
                        Default: Thank you for your inquiry. Unfortunately, we are unable to accept your request at this time.
                      </Text>
                    </View>

                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity 
                        style={styles.modalDeclineConfirmButton}
                        onPress={handleConfirmDecline}
                        disabled={respondLoading}
                      >
                        {respondLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Icon name="x-circle" size={18} color="#fff" />
                            <Text style={styles.modalConfirmText}>Confirm Decline</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.modalCancelButton}
                        onPress={() => {
                          setDeclineModalVisible(false);
                          setDeclineReason("");
                        }}
                      >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  // ... (keep all existing styles)
  container: {
    padding: 16,
    backgroundColor: "#ffff"
  },

  loadingContainer: {
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

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center"
  },

  icon: {
    marginRight: 10
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"
  },

  subtitle: {
    color: "#F1F1F1",
    fontSize: 13,
    marginRight: 5,
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 70,
    alignItems: "center"
  },

  badgeNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700"
  },

  badgeText: {
    color: "#fff",
    fontSize: 12
  },

  searchFilterBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10
  },

  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 10,
  },

  dropdownText: {
    fontSize: 13,
    color: "#888",
    marginHorizontal: 6,
  },

  dropdownList: {
    position: "absolute",
    top: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingVertical: 5,
    zIndex: 10,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  dropdownItemText: {
    fontSize: 15,
    color: "#333",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },

  notificationContainer: {
    marginTop: 10,
    marginBottom: 5,
  },

  notification: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  notificationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  detailcard: {
    backgroundColor: "#fff",
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 4
  },

  userRow: {
    flexDirection: "row",
    marginBottom: 15
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },

  contactText: {
    fontSize: 13,
    marginLeft: 6,
    color: "#555"
  },

  emailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pendingStatusBadge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },

  pendingStatusText: {
    fontSize: 12,
    color: "#B58900",
    fontWeight: "600"
  },

 respondedStatusBadge: {
  position: 'absolute',
  bottom: 40,      // distance from top
  right: 10,    // distance from right
  backgroundColor: "#D1FAE5",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 15,
},

  respondedStatusText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600"
  },

  closedStatusBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },

  closedStatusText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600"
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  infoBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4
  },

  blueBox: { backgroundColor: "#E7F0FF" },
  greenBox: { backgroundColor: "#E6F4EA" },
  purpleBox: { backgroundColor: "#EFE8FF" },
  orangeBox: { backgroundColor: "#FFF1E6" },

  label: {
    fontSize: 12,
    color: "#666",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3
  },

  messageBox: {
    backgroundColor: "#F7F9FC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E8F0",
    marginTop: 5
  },

  messageTitle: {
    fontWeight: "600",
    color: "#333"
  },

  messageText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18
  },

  responseMessageBox: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86EFAC",
    marginTop: 10,
    marginBottom: 5
  },

  responseMessageTitle: {
    fontWeight: "600",
    color: "#059669",
    marginLeft: 4
  },

  responseMessageText: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 18
  },

  declinedResponseMessageBox: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 10,
    marginBottom: 5
  },

  declinedResponseMessageTitle: {
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 4
  },

  declinedResponseMessageText: {
    fontSize: 13,
    color: "#991B1B",
    lineHeight: 18
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 16
  },

  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6
  },

  declineButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },

  declineText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6
  },

  acceptedButtonContainer: {
    flex: 1,
  },

  acceptedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  acceptedButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6
  },

  declinedButtonContainer: {
    flex: 1,
  },

  declinedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  declinedButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },

  modalBody: {
    padding: 20,
  },

  customerInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },

  eventInfo: {
    marginTop: 8,
  },

  eventText: {
    fontSize: 13,
    color: '#8b8b8c',
  },

  responseSection: {
    marginBottom: 24,
  },

  responseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  responseNote: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },

  editInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 100,
  },

  declineInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 12,
  },

  defaultDeclineText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },

  modalConfirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  modalDeclineConfirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  modalCancelText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomerInquiryCard;