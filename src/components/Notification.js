import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://api.aissignatureevent.com/api';

/**
 * VendorNotifications Component
 * Professional notification system for vendors
 * Shows inquiry updates, subscription alerts, reviews, etc.
 */
const VendorNotifications = () => {
  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount and set up interval
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Update count every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('vendorToken');
              if (!token) return;

              const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          }
        }
      ]
    );
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to link if provided
    if (notification.link) {
      setIsOpen(false);
      navigation.navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'inquiry':
        return <Icon name="mail" size={20} color="#3B82F6" />;
      case 'subscription':
        return <MaterialIcon name="trophy" size={20} color="#9333EA" />;
      case 'review':
        return <Icon name="star" size={20} color="#EAB308" />;
      case 'system':
        return <Icon name="alert-circle" size={20} color="#6B7280" />;
      default:
        return <Icon name="bell" size={20} color="#6B7280" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const BellButton = () => (
    <TouchableOpacity
      onPress={() => setIsOpen(true)}
      style={styles.bellButton}
      activeOpacity={0.7}
    >
      <Icon name="bell" size={22} color="#4B5563" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <BellButton />

      {/* Notification Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <View style={styles.unreadInfo}>
                <Text style={styles.unreadText}>
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {/* Notification List */}
            <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading notifications...</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="bell" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptySubtext}>
                    We'll notify you about inquiries, subscriptions, and more
                  </Text>
                </View>
              ) : (
                <View style={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification._id}
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.unreadItem
                      ]}
                      onPress={() => handleNotificationClick(notification)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notificationContent}>
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                          {getNotificationIcon(notification.type)}
                        </View>

                        {/* Content */}
                        <View style={styles.contentContainer}>
                          <View style={styles.titleRow}>
                            <Text style={[
                              styles.notificationTitle,
                              !notification.isRead && styles.unreadTitle
                            ]}>
                              {notification.title}
                            </Text>
                            {!notification.isRead && (
                              <View style={styles.unreadDot} />
                            )}
                          </View>
                          <Text style={styles.notificationMessage} numberOfLines={2}>
                            {notification.message}
                          </Text>
                          <View style={styles.footerRow}>
                            <Text style={styles.timeText}>
                              {formatTime(notification.createdAt)}
                            </Text>
                            {notification.link && (
                              <Icon name="external-link" size={12} color="#9CA3AF" />
                            )}
                          </View>
                        </View>

                        {/* Delete Button */}
                        <TouchableOpacity
                          onPress={() => deleteNotification(notification._id)}
                          style={styles.deleteButton}
                          activeOpacity={0.7}
                        >
                          <Icon name="trash-2" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            {notifications.length > 0 && (
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    setIsOpen(false);
                    navigation.navigate('VendorDashboard');
                  }}
                  style={styles.footerButton}
                >
                  <Text style={styles.footerButtonText}>View Dashboard</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContainer: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
borderBottomRightRadius: 20,
    overflow: 'hidden',
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#131dd7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e6e8ec',
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ededef',
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  closeButton: {
    padding: 4,
  },
  unreadInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  unreadText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  notificationList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadItem: {
    backgroundColor: '#EFF6FF',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  footerButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
});

export default VendorNotifications;