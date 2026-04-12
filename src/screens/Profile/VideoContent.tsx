import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import Video from "react-native-video";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

const VideoContent = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [limits, setLimits] = useState(null);
  const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0, videoCount: 0 });
  const [videoErrors, setVideoErrors] = useState({});

  useEffect(() => {
    console.log('🎬 VideoContent Component Mounted');
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      console.log('🔑 Token:', token ? `✅ Present` : '❌ NOT FOUND');
      
      const response = await fetch(`${API_BASE_URL}/vendor-profile/dashboard/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📦 Dashboard data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        // Set videos from the response
        setVideos(data.data.videos || []);
        setLimits(data.data.limits);
        setCurrentPlan(data.data.planKey || 'free');
        setCurrentUsage(data.data.currentUsage || { portfolioCount: 0, videoCount: 0 });
        console.log(`✅ Loaded ${data.data.videos?.length || 0} videos`);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      Alert.alert('Error', 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const getMaxVideos = () => {
    if (!limits) return 10;
    if (limits.videoLimit === -1) return Infinity;
    return limits.videoLimit || 5;
  };

  const canUploadVideo = () => {
    if (!limits) return false;
    if (!limits.allowVideos) return false;
    if (limits.videoLimit === -1) return true;
    return (currentUsage.videoCount || 0) < (limits.videoLimit || 5);
  };

  // FIXED: Video upload function using correct endpoint and FormData
  const uploadVideo = async (videoUri) => {
    console.log('📤 Starting video upload...');
    console.log('Video URI:', videoUri);
    
    return new Promise(async (resolve, reject) => {
      try {
        const token = await AsyncStorage.getItem('vendorToken');
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }
        
        const formData = new FormData();
        const filename = videoUri.split('/').pop() || 'video.mp4';
        
        // CORRECT FormData format for React Native
        formData.append('file', {
          uri: videoUri,
          type: 'video/mp4',
          name: filename,
        });
        formData.append('type', 'video');
        
        console.log('📦 FormData prepared, sending to:', `${API_BASE_URL}/vendor-profile/media`);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
            console.log(`📊 Upload progress: ${Math.round(percentComplete)}%`);
          }
        };
        
        xhr.onload = () => {
          console.log(`📡 Upload response status: ${xhr.status}`);
          
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('✅ Upload success:', response);
              if (response.success) {
                resolve(response.data || response);
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
              reject(new Error('Invalid server response'));
            }
          } else {
            let errorMsg = `Upload failed with status ${xhr.status}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMsg = errorResponse.message || errorMsg;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };
        
        xhr.onerror = () => {
          console.error('❌ XHR Error');
          reject(new Error('Network error during upload. Check your connection.'));
        };
        
        xhr.open('POST', `${API_BASE_URL}/vendor-profile/media`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        // DON'T set Content-Type header - let it be set automatically with boundary
        xhr.send(formData);
        
      } catch (error) {
        console.error('❌ Upload error:', error);
        reject(error);
      }
    });
  };

  // FIXED: Handle video upload with better error handling
  const handleUploadVideo = () => {
    launchImageLibrary(
      {
        mediaType: "video",
        quality: 0.5,
        videoQuality: "low",
        durationLimit: 60, // Limit to 60 seconds for testing
      },
      async (response) => {
        console.log('📱 ImagePicker response:', response);
        
        if (response.didCancel) {
          console.log('User cancelled');
          return;
        }
        
        if (response.error) {
          console.error('Picker error:', response.error);
          Alert.alert('Error', response.error);
          return;
        }
        
        if (response.assets && response.assets[0]) {
          const videoAsset = response.assets[0];
          const videoUri = videoAsset.uri;
          const fileSize = videoAsset.fileSize;
          
          console.log('Video URI:', videoUri);
          console.log('File size:', fileSize, 'bytes');
          
          // Check file size (max 50MB)
          if (fileSize && fileSize > 50 * 1024 * 1024) {
            Alert.alert('Error', 'Video too large. Max size is 50MB');
            return;
          }
          
          setUploading(true);
          setUploadProgress(0);
          setUploadStatus('Uploading video...');
          
          try {
            const uploadResult = await uploadVideo(videoUri);
            console.log('✅ Upload result:', uploadResult);
            
            // Refresh data
            await fetchAllData();
            
            Alert.alert(
              'Success', 
              'Video uploaded successfully! It will be visible after admin approval.'
            );
          } catch (error) {
            console.error('❌ Upload error:', error);
            Alert.alert(
              'Upload Failed', 
              error.message || 'Failed to upload video. Please try again with a smaller video.'
            );
          } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
          }
        }
      }
    );
  };

  const pickVideo = () => {
    console.log('🎯 pickVideo called');
    console.log('canUploadVideo:', canUploadVideo());
    console.log('limits:', limits);
    console.log('currentUsage:', currentUsage);
    
    if (!canUploadVideo()) {
      if (!limits?.allowVideos) {
        setUpgradeModalVisible(true);
      } else {
        const remaining = (limits?.videoLimit || 5) - (currentUsage.videoCount || 0);
        Alert.alert(
          'Limit Reached',
          `You have reached your ${currentPlan} plan limit. ${remaining > 0 ? `You have ${remaining} slots remaining.` : 'Upgrade to add more videos.'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') }
          ]
        );
      }
      return;
    }

    handleUploadVideo();
  };

  const deleteVideo = async (videoId) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('vendorToken');
              const response = await fetch(`${API_BASE_URL}/vendor-profile/media/${videoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await response.json();
              if (data.success) {
                await fetchAllData();
                Alert.alert('Success', 'Video deleted successfully!');
              } else {
                throw new Error(data.message || 'Failed to delete');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.message || 'Failed to delete video');
            }
          }
        }
      ]
    );
  };

  const toggleVisibility = async (videoId, currentVisibility) => {
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      const newVisibility = currentVisibility === 'public' ? 'hidden' : 'public';
      
      const response = await fetch(`${API_BASE_URL}/vendor-profile/media/${videoId}/toggle-visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visibility: newVisibility })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAllData();
        Alert.alert('Success', `Video is now ${data.data?.visibility || data.visibility}`);
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      Alert.alert('Error', 'Failed to update visibility');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return 0;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  // FIXED: Video renderItem with better error handling
  const renderItem = ({ item, index }) => {
    const videoUrl = item.videoUrl || item.url;
    console.log(`Video ${index} URL:`, videoUrl);
    
    return (
      <View style={styles.videoCard}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => {
            setSelectedVideo(item);
            setModalVisible(true);
          }}
        >
          <View style={styles.videoPlayerContainer}>
            <Video
              source={{ uri: videoUrl }}
              style={styles.videoPlayer}
              resizeMode="cover"
              paused={true}
              controls={false}
              repeat={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              onError={(error) => {
                console.log(`Video Error for ${videoUrl}:`, error);
                setVideoErrors(prev => ({ ...prev, [item._id]: true }));
              }}
              onLoad={() => {
                console.log(`Video loaded successfully: ${videoUrl}`);
                setVideoErrors(prev => ({ ...prev, [item._id]: false }));
              }}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000
              }}
            />
            
            {/* Show error message if video fails to load */}
            {videoErrors[item._id] && (
              <View style={styles.videoErrorOverlay}>
                <Icon name="alert-circle-outline" size={40} color="#FF4444" />
                <Text style={styles.videoErrorText}>Video failed to load</Text>
              </View>
            )}
            
            {/* Play Button Overlay */}
            <View style={styles.playOverlay}>
              <Icon name="play-circle" size={50} color="#FFFFFF" />
            </View>
          </View>
          
          {/* Duration Badge */}
          {(item.duration > 0 || item.metadata?.duration) && (
            <View style={styles.durationBadge}>
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.durationText}>{formatDuration(item.duration || item.metadata?.duration)}</Text>
            </View>
          )}
          
          {/* Visibility Badge */}
          {item.visibility === 'hidden' && (
            <View style={styles.visibilityBadge}>
              <Icon name="eye-off-outline" size={12} color="#FFFFFF" />
              <Text style={styles.visibilityText}>Hidden</Text>
            </View>
          )}
          
          {/* Approval Status Badge */}
          {item.approvalStatus === 'pending' && (
            <View style={styles.pendingBadge}>
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.pendingText}>Pending Approval</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.videoRow}>
          <View style={styles.channelIcon}>
            <Icon name="person" size={18} color="#fff" />
          </View>

          <View style={styles.videoTextContainer}>
            <Text style={styles.videoTitle}>
              {item.title || item.caption || `Portfolio Video ${index + 1}`}
            </Text>
            <View style={styles.videoStats}>
              <Text style={styles.videoSub}>
                {formatViews(item.views || 0)} views • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => toggleVisibility(item._id, item.visibility)}
              style={styles.actionButton}
            >
              <Icon 
                name={item.visibility === 'public' ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={item.visibility === 'public' ? "#4CAF50" : "#6B7280"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => deleteVideo(item._id)}
              style={styles.actionButton}
            >
              <Icon name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  const maxVideos = getMaxVideos();
  const videoCount = videos.length;
  const percentageUsed = maxVideos === Infinity ? 0 : (videoCount / maxVideos) * 100;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PLAN CARD */}
        {!limits?.allowVideos ? (
          <View style={styles.freePlanWarningCard}>
            <View style={styles.freePlanWarningHeader}>
              <Icon name="alert-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.freePlanWarningTitle}>📹 Video Uploads Not Available in Free Plan</Text>
            </View>
            <Text style={styles.freePlanWarningMessage}>
              Video content is a premium feature. Upgrade your plan to start uploading videos and showcase your work more effectively.
            </Text>
            <TouchableOpacity 
              style={styles.freePlanUpgradeButton}
              onPress={() => setUpgradeModalVisible(true)}
            >
              <Text style={styles.freePlanUpgradeButtonText}>Upgrade to Starter Plan (₹499) →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{marginTop: 20}}>
              <Text style={styles.planText}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                {limits?.planPrice && ` (${limits.planPrice})`}
              </Text>
            </View>
            
            <View style={styles.usageRow}>
              <Text style={styles.usageText}>
                {videoCount} of {maxVideos === Infinity ? 'Unlimited' : maxVideos} videos used
              </Text>
            </View>
            
            {maxVideos !== Infinity && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(percentageUsed, 100)}%` },
                  ]}
                />
              </View>
            )}
          </>
        )}

        {/* VIDEO CONTENT CARD */}
        <View style={styles.videoCardContainer}>
          <View style={styles.videoHeader}>
            <View style={{width : '70%'}}>
              <Text style={styles.sectionTitle}>Video Content</Text>
              <Text style={styles.sectionSub}>
                Showcase your work with video content
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                (!canUploadVideo() || uploading) && styles.uploadBtnDisabled
              ]}
              onPress={pickVideo}
              disabled={!canUploadVideo() || uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="cloud-upload-outline" size={18} color="#fff" />
                  <Text style={styles.uploadText}>
                    {!limits?.allowVideos ? 'Locked' : 
                     !canUploadVideo() ? 'Limit Reached' : 'Upload'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Upload Progress */}
          {uploading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{uploadStatus}</Text>
              <View style={styles.progressBarContainerLocal}>
                <View style={[styles.progressBarLocal, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{uploadProgress}%</Text>
            </View>
          )}

          {videos.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="videocam-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No videos yet</Text>
              <Text style={styles.emptyStateText}>
                {!limits?.allowVideos 
                  ? 'Video uploads are not available in your current plan. Upgrade to start uploading videos.'
                  : 'Upload your first video to engage more customers'}
              </Text>
              {canUploadVideo() ? (
                <TouchableOpacity style={styles.emptyStateButton} onPress={pickVideo}>
                  <Text style={styles.emptyStateButtonText}>Upload Video</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.emptyStateButton, styles.emptyStateButtonUpgrade]} 
                  onPress={() => setUpgradeModalVisible(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Upgrade to Upload Videos</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={videos}
              renderItem={renderItem}
              keyExtractor={(item, index) => item._id || index.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Video Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {selectedVideo && (
              <>
                <Video
                  source={{ uri: selectedVideo.videoUrl || selectedVideo.url }}
                  style={styles.modalVideo}
                  resizeMode="contain"
                  controls={true}
                  paused={false}
                  repeat={false}
                  onError={(error) => console.log('Modal video error:', error)}
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>
                    {selectedVideo.title || selectedVideo.caption || 'Portfolio Video'}
                  </Text>
                  <Text style={styles.modalStats}>
                    {formatViews(selectedVideo.views || 0)} views • {new Date(selectedVideo.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Upgrade Modal */}
      <Modal
        visible={upgradeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.upgradeModalContainer}>
            <TouchableOpacity
              style={styles.upgradeModalClose}
              onPress={() => setUpgradeModalVisible(false)}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.upgradeModalIcon}>
              <Icon name="videocam-outline" size={48} color="#F59E0B" />
            </View>

            <Text style={styles.upgradeModalTitle}>
              Upgrade Your Plan
            </Text>

            <Text style={styles.upgradeModalMessage}>
              📹 Video uploads are not available in the Free Plan. Upgrade to Starter Plan (₹499) or higher to upload videos.
            </Text>

            <View style={styles.upgradeModalButtons}>
              <TouchableOpacity
                style={styles.upgradeModalCancelButton}
                onPress={() => setUpgradeModalVisible(false)}
              >
                <Text style={styles.upgradeModalCancelText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  freePlanWarningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    margin: 16,
  },
  freePlanWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  freePlanWarningTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
  },
  freePlanWarningMessage: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 16,
  },
  freePlanUpgradeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  freePlanUpgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  planText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginHorizontal: 16,
    textTransform: "capitalize"
  },
  usageRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginHorizontal: 16,
  },
  usageText: {
    color: "#6B7280",
    fontSize: 14
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#4CAF50"
  },
  progressBarContainerLocal: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarLocal: {
    height: 8,
    backgroundColor: "#4F46E5"
  },
  videoCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  videoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  sectionSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2929e6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadBtnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  uploadText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 5,
    fontWeight: "500",
  },
  progressContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonUpgrade: {
    backgroundColor: '#2929E6',
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden"
  },
  videoPlayerContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: "#000"
  },
  videoPlayer: {
    width: "100%",
    height: 220,
    backgroundColor: "#000"
  },
  videoErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  videoErrorText: {
    color: '#FF4444',
    marginTop: 8,
    fontSize: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  visibilityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  visibilityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  pendingText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  videoRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "flex-start"
  },
  channelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2929e6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  videoTextContainer: {
    flex: 1
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111"
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  videoSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalVideo: {
    width: width,
    height: height - 100,
  },
  modalInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalStats: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
  upgradeModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  upgradeModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  upgradeModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  upgradeModalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  upgradeModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  upgradeModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  upgradeModalCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

export default VideoContent;