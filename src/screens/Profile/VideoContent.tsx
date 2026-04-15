// import React, { useState, useEffect } from "react";
// import { WebView } from 'react-native-webview';

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNavigation } from "@react-navigation/native";
// import { launchImageLibrary } from "react-native-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import RNFS from "react-native-fs";


// const { width, height } = Dimensions.get("window");
// const API_BASE_URL = "https://api.aissignatureevent.com/api";

// const VendorVideoManager = () => {
//   const navigation = useNavigation();
//   const [videos, setVideos] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [error, setError] = useState(null);
//   const [limits, setLimits] = useState(null);
//   const [planType, setPlanType] = useState("free");
//   const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0, videoCount: 0 });
//   const [modalVisible, setModalVisible] = useState(false);
//   const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
//   const [playingStates, setPlayingStates] = useState({});

//   useEffect(() => {
//     console.log("🚀 Component Mounted");
//     fetchVideos();
//     requestStoragePermission();
//   }, []);

//   const requestStoragePermission = async () => {
//     if (Platform.OS === "android") {
//       try {
//         const permission = Platform.Version >= 33
//           ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
//           : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

//         const granted = await PermissionsAndroid.request(permission, {
//           title: "Storage Permission",
//           message: "App needs access to your storage to upload videos",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK",
//         });

//         console.log("Storage permission:", granted);
//       } catch (err) {
//         console.warn(err);
//       }
//     }
//   };

//   const normalizeVideoUriForAndroid = async (uri) => {
//     if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
//       return uri;
//     }

//     const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.mp4`;

//     try {
//       await RNFS.copyFile(uri, destPath);
//       console.log("Copied to temp file:", destPath);
//       return destPath;
//     } catch (err) {
//       console.warn("Copy failed, using original:", err);
//       return uri;
//     }
//   };

//   const fetchVideos = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("vendorToken");

//       const response = await fetch(`${API_BASE_URL}/vendor-profile/dashboard/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await response.json();

//       if (data.success) {
//         console.log("Videos fetched:", data.data.videos?.length || 0);
//         setVideos(data.data.videos || []);
//         setLimits(data.data.limits);
//         setPlanType(data.data.planKey || "free");
//         setCurrentUsage(data.data.currentUsage || { portfolioCount: 0, videoCount: 0 });

//         const initialPlayingStates = {};
//         (data.data.videos || []).forEach((video) => {
//           initialPlayingStates[video._id] = true;
//         });
//         setPlayingStates(initialPlayingStates);
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setError("Failed to load videos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const canUploadVideo = () => {
//     if (!limits) return false;
//     if (!limits.allowVideos) return false;
//     if (limits.portfolioLimit === -1) return true;
//     return currentUsage.portfolioCount < limits.portfolioLimit;
//   };

//   const getMimeTypeFromName = (fileName) => {
//     if (!fileName) return "video/mp4";
//     const lower = fileName.toLowerCase();
//     if (lower.endsWith(".mov")) return "video/quicktime";
//     if (lower.endsWith(".mkv")) return "video/x-matroska";
//     if (lower.endsWith(".3gp") || lower.endsWith(".3gpp")) return "video/3gpp";
//     if (lower.endsWith(".avi")) return "video/x-msvideo";
//     return "video/mp4";
//   };

//   const uploadVideo = async (videoUri, fileName, fileType) => {
//     setUploadProgress(0);
    
//     try {
//       const token = await AsyncStorage.getItem('vendorToken');
      
//       if (!token) {
//         throw new Error('No authentication token found');
//       }
      
//       const uploadUri = await normalizeVideoUriForAndroid(videoUri);
//       const filePath = uploadUri.replace('file://', '');
      
//       console.log("File path:", filePath);
      
//       const exists = await RNFS.exists(filePath);
//       if (!exists) {
//         throw new Error('File does not exist');
//       }
      
//       const uploadResult = await RNFS.uploadFiles({
//         toUrl: `${API_BASE_URL}/vendor-profile/videos`,
//         files: [
//           {
//             name: 'media',
//             filename: fileName || 'video.mp4',
//             filepath: filePath,
//             filetype: fileType || 'video/mp4',
//           },
//         ],
//         fields: {
//           description: '',
//         },
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//         },
//         begin: (response) => {
//           console.log('Upload began:', response);
//         },
//         progress: (response) => {
//           const progress = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
//           setUploadProgress(progress);
//           console.log('Progress:', progress + '%');
//         },
//       }).promise;
      
//       console.log('Upload result status:', uploadResult.statusCode);
//       console.log('Upload result body:', uploadResult.body);
      
//       let data;
//       try {
//         data = JSON.parse(uploadResult.body);
//       } catch (e) {
//         data = { success: false, message: uploadResult.body };
//       }
      
//       setUploadProgress(100);
      
//       if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
//         if (data.success) {
//           return data;
//         }
//       }
      
//       throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);
      
//     } catch (error) {
//       console.error('Upload error:', error);
//       throw error;
//     }
//   };

//   const handleFileSelect = async () => {
//     const token = await AsyncStorage.getItem('vendorToken');
//     if (!token) {
//       Alert.alert("Login Required", "Please login as vendor first");
//       return;
//     }

//     if (!limits?.allowVideos) {
//       Alert.alert(
//         "Video Upload Not Available",
//         "Video uploads are not available in the Free Plan.\n\nUpgrade to Starter Plan (₹499) or higher.",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Upgrade", onPress: () => setUpgradeModalVisible(true) },
//         ]
//       );
//       return;
//     }

//     if (!canUploadVideo()) {
//       Alert.alert(
//         "Limit Reached",
//         `Portfolio limit reached (${currentUsage.portfolioCount}/${limits.portfolioLimit} media used).`,
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Upgrade", onPress: () => navigation.navigate("Subscription") },
//         ]
//       );
//       return;
//     }

//     launchImageLibrary(
//       {
//         mediaType: "video",
//         quality: 0.8,
//         videoQuality: "medium",
//       },
//       async (response) => {
//         if (response.didCancel) return;

//         if (response.errorCode) {
//           Alert.alert("Error", response.errorMessage);
//           return;
//         }

//         if (response.assets && response.assets[0]) {
//           const videoAsset = response.assets[0];
//           const videoUri = videoAsset.uri;
//           const fileType = videoAsset.type;
//           const fileName = videoAsset.fileName || "video.mp4";
//           const fileSize = videoAsset.fileSize || 0;

//           console.log("Video selected:", { fileName, fileSize, fileType });

//           const maxSize = 200 * 1024 * 1024;
//           if (fileSize > maxSize) {
//             Alert.alert("Error", "Video file exceeds 200MB limit");
//             return;
//           }

//           setUploading(true);
//           setUploadProgress(0);
//           setUploadStatus("Uploading video...");

//           try {
//             const uploadResult = await uploadVideo(videoUri, fileName, fileType);
//             console.log("Upload success:", uploadResult);

//             if (uploadResult && uploadResult.success) {
//               await fetchVideos();
//               Alert.alert("Success", "Video uploaded successfully! It will be visible after admin approval.");
//             } else {
//               throw new Error(uploadResult?.message || "Upload failed");
//             }
//           } catch (error) {
//             const message = error?.message || String(error);
//             console.error("Upload error:", message);
//             Alert.alert("Upload Failed", message);
//           } finally {
//             setUploading(false);
//             setUploadProgress(0);
//             setUploadStatus("");
//           }
//         }
//       }
//     );
//   };

//   const toggleVisibility = async (videoId, currentVisibility) => {
//     try {
//       const token = await AsyncStorage.getItem("vendorToken");
//       const newVisibility = currentVisibility === "public" ? "hidden" : "public";

//       const response = await fetch(
//         `${API_BASE_URL}/vendor-profile/videos/${videoId}/toggle-visibility`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ visibility: newVisibility }),
//         }
//       );

//       const data = await response.json();
//       if (data.success) {
//         setVideos(
//           videos.map((v) =>
//             v._id === videoId ? { ...v, visibility: data.data?.visibility || data.visibility } : v
//           )
//         );
//         Alert.alert("Success", `Video is now ${data.data?.visibility || data.visibility}`);
//       }
//     } catch (error) {
//       console.error("Toggle error:", error);
//       Alert.alert("Error", "Failed to update visibility");
//     }
//   };

//   const deleteVideo = async (videoId) => {
//     Alert.alert(
//       "Delete Video",
//       "Are you sure you want to delete this video?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("vendorToken");
//               const response = await fetch(`${API_BASE_URL}/vendor-profile/videos/${videoId}`, {
//                 method: "DELETE",
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               const data = await response.json();
//               if (data.success) {
//                 setVideos(videos.filter((v) => v._id !== videoId));
//                 Alert.alert("Success", "Video deleted successfully!");
//               }
//             } catch (error) {
//               Alert.alert("Error", "Failed to delete video");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const togglePlayPause = (videoId) => {
//     setPlayingStates((prev) => ({
//       ...prev,
//       [videoId]: !prev[videoId],
//     }));
//   };

//   const formatDuration = (seconds) => {
//     if (!seconds) return "0:00";
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const formatViews = (views) => {
//     if (!views) return 0;
//     if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
//     if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
//     return views;
//   };


// const renderItem = ({ item, index }) => {
//   const isPlaying = playingStates[item._id] !== false;
//   const videoUrl = item.videoUrl || item.url;
//   const formattedUrl = videoUrl?.replace('http://', 'https://');
  
//   const videoHTML = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
//       <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body { background: #000; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
//         video { width: 100%; height: 100%; object-fit: contain; }
//       </style>
//     </head>
//     <body>
//       <video id="videoPlayer" src="${formattedUrl}" controls playsinline webkit-playsinline style="width:100%; height:100%; object-fit:contain;"></video>
//       <script>
//         var video = document.getElementById('videoPlayer');
//         video.addEventListener('play', function() { window.ReactNativeWebView.postMessage('playing'); });
//         video.addEventListener('pause', function() { window.ReactNativeWebView.postMessage('paused'); });
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <View style={styles.videoCard}>
//       <View style={styles.videoPlayerContainer}>
//         <WebView
//           source={{ html: videoHTML }}
//           style={styles.videoPlayer}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           allowsInlineMediaPlayback={true}
//           mediaPlaybackRequiresUserAction={true}
//           onMessage={(event) => console.log('WebView message:', event.nativeEvent.data)}
//           onError={(error) => console.error('WebView error:', error)}
//         />
        
//         <TouchableOpacity style={styles.playOverlay} onPress={() => togglePlayPause(item._id)} activeOpacity={0.8}>
//           <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={50} color="#FFFFFF" />
//         </TouchableOpacity>

//         {item.duration > 0 && (
//           <View style={styles.durationBadge}>
//             <Icon name="time-outline" size={12} color="#FFFFFF" />
//             <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
//           </View>
//         )}

//         {item.visibility === "hidden" && (
//           <View style={styles.visibilityBadge}>
//             <Icon name="eye-off-outline" size={12} color="#FFFFFF" />
//             <Text style={styles.visibilityText}>Hidden</Text>
//           </View>
//         )}

//         {item.approvalStatus === "pending" && (
//           <View style={styles.pendingBadge}>
//             <Icon name="time-outline" size={12} color="#FFFFFF" />
//             <Text style={styles.pendingText}>Pending Approval</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.videoInfo}>
//         <Text style={styles.videoTitle}>Portfolio Video {index + 1}</Text>

//         <View style={styles.statsContainer}>
//           <Icon name="eye-outline" size={14} color="#6B7280" />
//           <Text style={styles.statText}>{formatViews(item.views || 0)} views</Text>
//           <Text style={styles.statText}>•</Text>
//           <Text style={styles.statText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity style={[styles.actionButton, styles.previewButton]} onPress={() => { setSelectedVideo(item); setModalVisible(true); }}>
//             <Icon name="play-circle-outline" size={18} color="#4F46E5" />
//             <Text style={styles.previewButtonText}>Preview</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionButton, item.visibility === "public" ? styles.publicButton : styles.hiddenButton]} onPress={() => toggleVisibility(item._id, item.visibility)}>
//             <Icon name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"} size={18} color={item.visibility === "public" ? "#10B981" : "#6B7280"} />
//             <Text style={item.visibility === "public" ? styles.publicButtonText : styles.hiddenButtonText}>{item.visibility === "public" ? "Public" : "Hidden"}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteVideo(item._id)}>
//             <Icon name="trash-outline" size={18} color="#EF4444" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//         <Text style={styles.loadingText}>Loading videos...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {limits && limits.allowVideos && (
//         <View style={styles.planInfoBanner}>
//           <View style={styles.planInfoBannerContent}>
//             <View>
//               <Text style={styles.planInfoBannerTitle}>
//                 {limits.planName} {limits.planPrice && `(${limits.planPrice})`}
//               </Text>
//               <Text style={styles.planInfoBannerText}>
//                 {limits.portfolioLimit === -1 ? (
//                   <Text><Text style={{ fontWeight: "bold" }}>Unlimited</Text> media uploads</Text>
//                 ) : (
//                   <Text>
//                     <Text style={{ fontWeight: "bold" }}>{currentUsage.portfolioCount}</Text> of{" "}
//                     <Text style={{ fontWeight: "bold" }}>{limits.portfolioLimit}</Text> media used
//                   </Text>
//                 )}
//               </Text>
//             </View>
//           </View>
//         </View>
//       )}

//       <View style={styles.header}>
//         <View>
//           <Text style={styles.headerTitle}>Video Content</Text>
//           <Text style={styles.headerSubtitle}>
//             Showcase your work with video content
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.uploadButton,
//             (!canUploadVideo() || uploading) && styles.uploadButtonDisabled,
//           ]}
//           onPress={handleFileSelect}
//           disabled={!canUploadVideo() || uploading}
//         >
//           {uploading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <>
//               <Icon name="cloud-upload-outline" size={20} color="#FFFFFF" />
//               <Text style={styles.uploadButtonText}>
//                 {uploading ? "Uploading…" : "Upload Videos"}
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>

//       {uploading && (
//         <View style={styles.progressContainer}>
//           <View style={styles.progressHeader}>
//             <Text style={styles.progressStatus}>{uploadStatus || "Uploading…"}</Text>
//             <Text style={styles.progressPercent}>{uploadProgress}%</Text>
//           </View>
//           <View style={styles.progressBarContainer}>
//             <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
//           </View>
//         </View>
//       )}

//       {videos.length === 0 ? (
//         <View style={styles.emptyState}>
//           <Icon name="videocam-outline" size={64} color="#D1D5DB" />
//           <Text style={styles.emptyStateTitle}>No Videos Yet</Text>
//           <Text style={styles.emptyStateText}>Upload videos to showcase your work</Text>
//           <TouchableOpacity
//             style={styles.emptyStateButton}
//             onPress={handleFileSelect}
//             disabled={uploading}
//           >
//             <Icon name="cloud-upload-outline" size={20} color="#FFFFFF" />
//             <Text style={styles.emptyStateButtonText}>Upload Your First Videos</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={videos}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => item._id || index.toString()}
//           scrollEnabled={false}
//         />
//       )}

//     <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
//   <View style={styles.modalOverlay}>
//     <View style={styles.modalContent}>
//       <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
//         <Icon name="close" size={24} color="#FFFFFF" />
//       </TouchableOpacity>
//       {selectedVideo && (
//         <WebView
//           source={{ html: `
//             <!DOCTYPE html>
//             <html>
//             <head>
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <style>body{margin:0;padding:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;}video{width:100%;height:100%;object-fit:contain;}</style>
//             </head>
//             <body>
//               <video src="${selectedVideo.videoUrl || selectedVideo.url}" controls autoplay style="width:100%;height:100%;object-fit:contain;"></video>
//             </body>
//             </html>
//           ` }}
//           style={styles.modalVideo}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           allowsInlineMediaPlayback={true}
//           mediaPlaybackRequiresUserAction={false}
//         />
//       )}
//     </View>
//   </View>
// </Modal>

//       <Modal visible={upgradeModalVisible} transparent={true} animationType="fade" onRequestClose={() => setUpgradeModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.upgradeModalContainer}>
//             <TouchableOpacity style={styles.upgradeModalClose} onPress={() => setUpgradeModalVisible(false)}>
//               <Icon name="close" size={24} color="#6B7280" />
//             </TouchableOpacity>
//             <View style={styles.upgradeModalIcon}>
//               <Icon name="videocam-outline" size={48} color="#F59E0B" />
//             </View>
//             <Text style={styles.upgradeModalTitle}>Upgrade Your Plan</Text>
//             <Text style={styles.upgradeModalMessage}>
//               Video uploads are not available in the Free Plan. Upgrade to Starter Plan (₹499) or higher to upload videos.
//             </Text>
//             <View style={styles.upgradeModalButtons}>
//               <TouchableOpacity style={styles.upgradeModalCancelButton} onPress={() => setUpgradeModalVisible(false)}>
//                 <Text style={styles.upgradeModalCancelText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.upgradeModalUpgradeButton} onPress={() => {
//                 setUpgradeModalVisible(false);
//                 navigation.navigate("Subscription");
//               }}>
//                 <Text style={styles.upgradeModalUpgradeText}>Upgrade Now</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#6B7280",
//   },
//   planInfoBanner: {
//     margin: 16,
//     marginBottom: 0,
//     padding: 16,
//     backgroundColor: "#EFF6FF",
//     borderWidth: 1,
//     borderColor: "#BFDBFE",
//     borderRadius: 12,
//   },
//   planInfoBannerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   planInfoBannerTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   planInfoBannerText: {
//     fontSize: 12,
//     color: "#374151",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     marginTop: 10,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1F2937",
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 2,
//   },
//   uploadButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#7C3AED",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     gap: 8,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#9CA3AF",
//     opacity: 0.6,
//   },
//   uploadButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   progressContainer: {
//     margin: 16,
//     padding: 12,
//     backgroundColor: "#F3E8FF",
//     borderRadius: 8,
//   },
//   progressHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   progressStatus: {
//     fontSize: 12,
//     color: "#6B21A5",
//   },
//   progressPercent: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#6B21A5",
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: "#E9D5FF",
//     borderRadius: 3,
//     overflow: "hidden",
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: "#7C3AED",
//     borderRadius: 3,
//   },
//   emptyState: {
//     alignItems: "center",
//     paddingVertical: 48,
//     marginHorizontal: 16,
//     backgroundColor: "#F9FAFB",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderStyle: "dashed",
//   },
//   emptyStateTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#374151",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginBottom: 24,
//     textAlign: "center",
//   },
//   emptyStateButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#7C3AED",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     gap: 8,
//   },
//   emptyStateButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   videoCard: {
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: 16,
//     marginBottom: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     overflow: "hidden",
//   },
//   videoPlayerContainer: {
//    width: "100%",
//   height: 220,
//   backgroundColor: "#000",
//   overflow: "hidden",
//   position: "relative",
// },
// videoPlayer: {
//    width: "100%",
//   height: 220,
//   backgroundColor: "#000",
//   flex: 1,
// },
// playOverlay: {
//   position: "absolute",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   justifyContent: "center",
//   alignItems: "center",
//   backgroundColor: "rgba(0,0,0,0.3)",
//   zIndex: 10,
// },
//   durationBadge: {
//     position: "absolute",
//     bottom: 8,
//     right: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.75)",
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 4,
//     gap: 4,
//     zIndex: 2,
//   },
//   durationText: {
//     fontSize: 11,
//     color: "#FFFFFF",
//   },
//   visibilityBadge: {
//     position: "absolute",
//     top: 8,
//     left: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(239, 68, 68, 0.9)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     gap: 4,
//     zIndex: 2,
//   },
//   visibilityText: {
//     fontSize: 10,
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },
//   pendingBadge: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(245, 158, 11, 0.9)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     gap: 4,
//     zIndex: 2,
//   },
//   pendingText: {
//     fontSize: 10,
//     color: "#FFFFFF",
//     fontWeight: "600",
//   },
//   videoInfo: {
//     padding: 12,
//   },
//   videoTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: 4,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   statText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   previewButton: {
//     backgroundColor: "#EEF2FF",
//   },
//   previewButtonText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#4F46E5",
//   },
//   publicButton: {
//     backgroundColor: "#D1FAE5",
//   },
//   publicButtonText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#10B981",
//   },
//   hiddenButton: {
//     backgroundColor: "#F3F4F6",
//   },
//   hiddenButtonText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#6B7280",
//   },
//   deleteButton: {
//     flex: 0.3,
//     backgroundColor: "#FEE2E2",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: width,
//     height: height,
//     backgroundColor: "#000",
//     justifyContent: "center",
//   },
//   closeModalButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     borderRadius: 20,
//     padding: 8,
//   },
//   modalVideo: {
//     width: width,
//     height: height - 100,
//   },
//   upgradeModalContainer: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 24,
//     width: "85%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   upgradeModalClose: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     padding: 4,
//   },
//   upgradeModalIcon: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#FEF3C7",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   upgradeModalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111827",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   upgradeModalMessage: {
//     fontSize: 14,
//     color: "#6B7280",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   upgradeModalButtons: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },
//   upgradeModalCancelButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     alignItems: "center",
//   },
//   upgradeModalCancelText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#374151",
//   },
//   upgradeModalUpgradeButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: "#7C3AED",
//     alignItems: "center",
//   },
//   upgradeModalUpgradeText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#FFFFFF",
//   },
// });

// export default VendorVideoManager;
import React, { useState, useEffect } from "react";
import { WebView } from 'react-native-webview';

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
  Platform,
  PermissionsAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";


const { width, height } = Dimensions.get("window");
const API_BASE_URL = "https://api.aissignatureevent.com/api";

const VendorVideoManager = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState(null);
  const [limits, setLimits] = useState(null);
  const [planType, setPlanType] = useState("free");
  const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0, videoCount: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [playingStates, setPlayingStates] = useState({});
  const [videoDebugInfo, setVideoDebugInfo] = useState({}); // Debug info for each video

  useEffect(() => {
    console.log("🚀 Component Mounted");
    console.log("📱 Platform:", Platform.OS);
    console.log("📱 Platform Version:", Platform.Version);
    fetchVideos();
    requestStoragePermission();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        console.log("🔐 Requesting permission:", permission);
        const granted = await PermissionsAndroid.request(permission, {
          title: "Storage Permission",
          message: "App needs access to your storage to upload videos",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });

        console.log("✅ Storage permission result:", granted);
      } catch (err) {
        console.error("❌ Storage permission error:", err);
      }
    }
  };

  const normalizeVideoUriForAndroid = async (uri) => {
    console.log("📁 Normalizing URI:", uri);
    if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
      console.log("📁 No normalization needed");
      return uri;
    }

    const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.mp4`;
    console.log("📁 Destination path:", destPath);

    try {
      await RNFS.copyFile(uri, destPath);
      console.log("✅ Copied to temp file:", destPath);
      return destPath;
    } catch (err) {
      console.warn("⚠️ Copy failed, using original:", err);
      return uri;
    }
  };

  const fetchVideos = async () => {
    try {
      console.log("🔄 Fetching videos from API...");
      setLoading(true);
      const token = await AsyncStorage.getItem("vendorToken");
      console.log("🔑 Token available:", token ? "Yes" : "No");

      const response = await fetch(`${API_BASE_URL}/vendor-profile/dashboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 API Response Status:", response.status);
      const data = await response.json();
      console.log("📦 API Response Data:", JSON.stringify(data, null, 2));

      if (data.success) {
        console.log("✅ Videos fetched successfully!");
        console.log("📹 Total videos:", data.data.videos?.length || 0);
        
        // Detailed video debugging
        if (data.data.videos && data.data.videos.length > 0) {
          console.log("\n========== VIDEO DEBUG INFO ==========");
          data.data.videos.forEach((video, idx) => {
            console.log(`\n📹 Video ${idx + 1}:`);
            console.log(`  ID: ${video._id}`);
            console.log(`  Original videoUrl: ${video.videoUrl}`);
            console.log(`  Original url: ${video.url}`);
            console.log(`  Approval Status: ${video.approvalStatus}`);
            console.log(`  Visibility: ${video.visibility}`);
            console.log(`  Duration: ${video.duration}`);
            console.log(`  Views: ${video.views}`);
            console.log(`  Created At: ${video.createdAt}`);
            
            // Check URL format
            const videoUrl = video.videoUrl || video.url;
            if (videoUrl) {
              console.log(`  URL starts with http: ${videoUrl.startsWith('http')}`);
              console.log(`  URL is HTTPS: ${videoUrl.startsWith('https')}`);
              console.log(`  Full URL: ${videoUrl}`);
            } else {
              console.log(`  ❌ No URL found for this video!`);
            }
          });
          console.log("=====================================\n");
        } else {
          console.log("⚠️ No videos found in response");
        }
        
        setVideos(data.data.videos || []);
        setLimits(data.data.limits);
        setPlanType(data.data.planKey || "free");
        setCurrentUsage(data.data.currentUsage || { portfolioCount: 0, videoCount: 0 });

        const initialPlayingStates = {};
        (data.data.videos || []).forEach((video) => {
          initialPlayingStates[video._id] = true;
        });
        setPlayingStates(initialPlayingStates);
      } else {
        console.error("❌ API returned success: false", data);
        setError("Failed to load videos");
      }
    } catch (error) {
      console.error("❌ Fetch error details:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
      console.log("🏁 Fetch videos completed");
    }
  };

  const canUploadVideo = () => {
    if (!limits) {
      console.log("⚠️ Limits not loaded yet");
      return false;
    }
    if (!limits.allowVideos) {
      console.log("⚠️ Videos not allowed in current plan");
      return false;
    }
    if (limits.portfolioLimit === -1) {
      console.log("✅ Unlimited portfolio limit");
      return true;
    }
    const canUpload = currentUsage.portfolioCount < limits.portfolioLimit;
    console.log(`📊 Portfolio usage: ${currentUsage.portfolioCount}/${limits.portfolioLimit}, Can upload: ${canUpload}`);
    return canUpload;
  };

  const getMimeTypeFromName = (fileName) => {
    if (!fileName) return "video/mp4";
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".mov")) return "video/quicktime";
    if (lower.endsWith(".mkv")) return "video/x-matroska";
    if (lower.endsWith(".3gp") || lower.endsWith(".3gpp")) return "video/3gpp";
    if (lower.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  };

  const uploadVideo = async (videoUri, fileName, fileType) => {
    console.log("📤 Starting upload...");
    console.log("  URI:", videoUri);
    console.log("  FileName:", fileName);
    console.log("  FileType:", fileType);
    setUploadProgress(0);
    
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log("🔑 Token found for upload");
      
      const uploadUri = await normalizeVideoUriForAndroid(videoUri);
      const filePath = uploadUri.replace('file://', '');
      
      console.log("📁 Final file path:", filePath);
      
      const exists = await RNFS.exists(filePath);
      console.log("📁 File exists:", exists);
      if (!exists) {
        throw new Error('File does not exist at path: ' + filePath);
      }
      
      console.log("🚀 Starting file upload to server...");
      const uploadResult = await RNFS.uploadFiles({
        toUrl: `${API_BASE_URL}/vendor-profile/videos`,
        files: [
          {
            name: 'media',
            filename: fileName || 'video.mp4',
            filepath: filePath,
            filetype: fileType || 'video/mp4',
          },
        ],
        fields: {
          description: '',
        },
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        begin: (response) => {
          console.log('✅ Upload began, jobId:', response.jobId);
        },
        progress: (response) => {
          const progress = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
          setUploadProgress(progress);
          console.log('📊 Upload progress:', progress + '%');
        },
      }).promise;
      
      console.log('📡 Upload result status code:', uploadResult.statusCode);
      console.log('📡 Upload result body:', uploadResult.body);
      
      let data;
      try {
        data = JSON.parse(uploadResult.body);
        console.log('📦 Parsed response:', data);
      } catch (e) {
        console.error('❌ Failed to parse response:', e);
        data = { success: false, message: uploadResult.body };
      }
      
      setUploadProgress(100);
      
      if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
        if (data.success) {
          console.log("✅ Upload successful!");
          return data;
        }
      }
      
      throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);
      
    } catch (error) {
      console.error('❌ Upload error details:', error);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  };

  const handleFileSelect = async () => {
    console.log("🎬 handleFileSelect called");
    const token = await AsyncStorage.getItem('vendorToken');
    if (!token) {
      console.log("❌ No token found");
      Alert.alert("Login Required", "Please login as vendor first");
      return;
    }

    if (!limits?.allowVideos) {
      console.log("❌ Videos not allowed in current plan");
      Alert.alert(
        "Video Upload Not Available",
        "Video uploads are not available in the Free Plan.\n\nUpgrade to Starter Plan (₹499) or higher.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => setUpgradeModalVisible(true) },
        ]
      );
      return;
    }

    if (!canUploadVideo()) {
      console.log("❌ Upload limit reached");
      Alert.alert(
        "Limit Reached",
        `Portfolio limit reached (${currentUsage.portfolioCount}/${limits.portfolioLimit} media used).`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate("Subscription") },
        ]
      );
      return;
    }

    console.log("📱 Launching image library for video selection...");
    launchImageLibrary(
      {
        mediaType: "video",
        quality: 0.8,
        videoQuality: "medium",
      },
      async (response) => {
        console.log("📱 Image library response:", response);
        if (response.didCancel) {
          console.log("❌ User cancelled selection");
          return;
        }

        if (response.errorCode) {
          console.error("❌ Error selecting video:", response.errorMessage);
          Alert.alert("Error", response.errorMessage);
          return;
        }

        if (response.assets && response.assets[0]) {
          const videoAsset = response.assets[0];
          const videoUri = videoAsset.uri;
          const fileType = videoAsset.type;
          const fileName = videoAsset.fileName || "video.mp4";
          const fileSize = videoAsset.fileSize || 0;

          console.log("✅ Video selected successfully:");
          console.log("  FileName:", fileName);
          console.log("  FileSize:", fileSize, "bytes");
          console.log("  FileType:", fileType);
          console.log("  URI:", videoUri);

          const maxSize = 200 * 1024 * 1024;
          if (fileSize > maxSize) {
            console.log("❌ File too large:", fileSize, ">", maxSize);
            Alert.alert("Error", "Video file exceeds 200MB limit");
            return;
          }

          setUploading(true);
          setUploadProgress(0);
          setUploadStatus("Uploading video...");

          try {
            const uploadResult = await uploadVideo(videoUri, fileName, fileType);
            console.log("✅ Upload success result:", uploadResult);

            if (uploadResult && uploadResult.success) {
              console.log("🔄 Refreshing video list...");
              await fetchVideos();
              Alert.alert("Success", "Video uploaded successfully! It will be visible after admin approval.");
            } else {
              throw new Error(uploadResult?.message || "Upload failed");
            }
          } catch (error) {
            const message = error?.message || String(error);
            console.error("❌ Upload error:", message);
            Alert.alert("Upload Failed", message);
          } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadStatus("");
          }
        } else {
          console.log("❌ No assets found in response");
        }
      }
    );
  };

  const toggleVisibility = async (videoId, currentVisibility) => {
    console.log(`👁️ Toggling visibility for video ${videoId} from ${currentVisibility}`);
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const newVisibility = currentVisibility === "public" ? "hidden" : "public";
      console.log(`🔄 New visibility: ${newVisibility}`);

      const response = await fetch(
        `${API_BASE_URL}/vendor-profile/videos/${videoId}/toggle-visibility`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visibility: newVisibility }),
        }
      );

      const data = await response.json();
      console.log("📡 Toggle response:", data);
      if (data.success) {
        setVideos(
          videos.map((v) =>
            v._id === videoId ? { ...v, visibility: data.data?.visibility || data.visibility } : v
          )
        );
        Alert.alert("Success", `Video is now ${data.data?.visibility || data.visibility}`);
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
      Alert.alert("Error", "Failed to update visibility");
    }
  };

  const deleteVideo = async (videoId) => {
    console.log(`🗑️ Deleting video ${videoId}`);
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("vendorToken");
              const response = await fetch(`${API_BASE_URL}/vendor-profile/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              console.log("📡 Delete response:", data);
              if (data.success) {
                setVideos(videos.filter((v) => v._id !== videoId));
                Alert.alert("Success", "Video deleted successfully!");
              }
            } catch (error) {
              console.error("❌ Delete error:", error);
              Alert.alert("Error", "Failed to delete video");
            }
          },
        },
      ]
    );
  };

  const togglePlayPause = (videoId) => {
    console.log(`⏯️ Toggle play/pause for video ${videoId}`);
    setPlayingStates((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (!views) return 0;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views;
  };

  // Helper function to get full video URL
  const getFullVideoUrl = (videoUrl) => {
    if (!videoUrl) {
      console.log("❌ getFullVideoUrl: videoUrl is null/undefined");
      return null;
    }
    
    console.log("🔗 Original URL:", videoUrl);
    
    // If URL is already absolute
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      const httpsUrl = videoUrl.replace('http://', 'https://');
      console.log("✅ Using HTTPS URL:", httpsUrl);
      return httpsUrl;
    }
    
    // If relative URL
    if (videoUrl.startsWith('/')) {
      const fullUrl = `${API_BASE_URL}${videoUrl}`;
      console.log("✅ Constructed full URL from relative:", fullUrl);
      return fullUrl;
    }
    
    // Fallback
    const fullUrl = `${API_BASE_URL}/${videoUrl}`;
    console.log("✅ Constructed full URL (fallback):", fullUrl);
    return fullUrl;
  };

  const renderItem = ({ item, index }) => {
    console.log(`🎬 Rendering video ${index + 1}:`, item._id);
    
    const isPlaying = playingStates[item._id] !== false;
    let videoUrl = item.videoUrl || item.url;
    
    console.log(`📹 Video ${index + 1} - Raw URL:`, videoUrl);
    
    // Get full URL
    const fullVideoUrl = getFullVideoUrl(videoUrl);
    console.log(`📹 Video ${index + 1} - Full URL:`, fullVideoUrl);
    
    // Check if URL is valid
    if (!fullVideoUrl) {
      console.error(`❌ Video ${index + 1} has no valid URL!`);
      return (
        <View style={styles.videoCard}>
          <View style={[styles.videoPlayerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="alert-circle-outline" size={50} color="#FF4444" />
            <Text style={{ color: '#FFF', marginTop: 10 }}>No Video URL Available</Text>
            <Text style={{ color: '#999', fontSize: 12, marginTop: 5 }}>Video ID: {item._id}</Text>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>Portfolio Video {index + 1}</Text>
          </View>
        </View>
      );
    }
    
    // Check if video is pending approval
    if (item.approvalStatus === "pending") {
      console.log(`⏳ Video ${index + 1} is pending approval, will not play`);
    }
    
    const videoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
          video { width: 100%; height: 100%; object-fit: contain; }
          .error { color: red; text-align: center; padding: 20px; }
        </style>
      </head>
      <body>
        <video id="videoPlayer" controls playsinline webkit-playsinline style="width:100%; height:100%; object-fit:contain;">
          <source src="${fullVideoUrl}" type="video/mp4">
          <source src="${fullVideoUrl}" type="video/quicktime">
          <div class="error">Video format not supported</div>
        </video>
        <script>
          var video = document.getElementById('videoPlayer');
          video.addEventListener('play', function() { 
            console.log('Video playing');
            window.ReactNativeWebView.postMessage('playing'); 
          });
          video.addEventListener('pause', function() { 
            console.log('Video paused');
            window.ReactNativeWebView.postMessage('paused'); 
          });
          video.addEventListener('error', function(e) { 
            console.error('Video error:', e);
            window.ReactNativeWebView.postMessage('error: ' + e.target.error?.message); 
          });
          video.addEventListener('loadeddata', function() { 
            console.log('Video data loaded');
          });
          console.log('Video element created with src:', video.src);
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.videoCard}>
        <View style={styles.videoPlayerContainer}>
          <WebView
            source={{ html: videoHTML }}
            style={styles.videoPlayer}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={true}
            onMessage={(event) => {
              console.log(`📨 WebView message for video ${item._id}:`, event.nativeEvent.data);
              if (event.nativeEvent.data === 'playing') {
                console.log(`▶️ Video ${item._id} started playing`);
              } else if (event.nativeEvent.data === 'paused') {
                console.log(`⏸️ Video ${item._id} paused`);
              } else if (event.nativeEvent.data.startsWith('error')) {
                console.error(`❌ Video ${item._id} error:`, event.nativeEvent.data);
              }
            }}
            onError={(error) => {
              console.error(`❌ WebView error for video ${item._id}:`, error);
              console.error(`  URL that failed: ${fullVideoUrl}`);
            }}
            onLoadStart={() => console.log(`🔄 WebView loading started for video ${item._id}`)}
            onLoadEnd={() => console.log(`✅ WebView loading finished for video ${item._id}`)}
          />
          
          <TouchableOpacity style={styles.playOverlay} onPress={() => togglePlayPause(item._id)} activeOpacity={0.8}>
            <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={50} color="#FFFFFF" />
          </TouchableOpacity>

          {item.duration > 0 && (
            <View style={styles.durationBadge}>
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
            </View>
          )}

          {item.visibility === "hidden" && (
            <View style={styles.visibilityBadge}>
              <Icon name="eye-off-outline" size={12} color="#FFFFFF" />
              <Text style={styles.visibilityText}>Hidden</Text>
            </View>
          )}

          {item.approvalStatus === "pending" && (
            <View style={styles.pendingBadge}>
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.pendingText}>Pending Approval</Text>
            </View>
          )}
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>Portfolio Video {index + 1}</Text>
          
          {/* Debug info for developers - remove in production */}
          {__DEV__ && (
            <Text style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>
              URL: {fullVideoUrl?.substring(0, 50)}...
            </Text>
          )}

          <View style={styles.statsContainer}>
            <Icon name="eye-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{formatViews(item.views || 0)} views</Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.previewButton]} onPress={() => { 
              console.log(`🔍 Preview video ${item._id}`);
              setSelectedVideo(item); 
              setModalVisible(true); 
            }}>
              <Icon name="play-circle-outline" size={18} color="#4F46E5" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, item.visibility === "public" ? styles.publicButton : styles.hiddenButton]} onPress={() => toggleVisibility(item._id, item.visibility)}>
              <Icon name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"} size={18} color={item.visibility === "public" ? "#10B981" : "#6B7280"} />
              <Text style={item.visibility === "public" ? styles.publicButtonText : styles.hiddenButtonText}>{item.visibility === "public" ? "Public" : "Hidden"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteVideo(item._id)}>
              <Icon name="trash-outline" size={18} color="#EF4444" />
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {limits && limits.allowVideos && (
        <View style={styles.planInfoBanner}>
          <View style={styles.planInfoBannerContent}>
            <View>
              <Text style={styles.planInfoBannerTitle}>
                {limits.planName} {limits.planPrice && `(${limits.planPrice})`}
              </Text>
              <Text style={styles.planInfoBannerText}>
                {limits.portfolioLimit === -1 ? (
                  <Text><Text style={{ fontWeight: "bold" }}>Unlimited</Text> media uploads</Text>
                ) : (
                  <Text>
                    <Text style={{ fontWeight: "bold" }}>{currentUsage.portfolioCount}</Text> of{" "}
                    <Text style={{ fontWeight: "bold" }}>{limits.portfolioLimit}</Text> media used
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Video Content</Text>
          <Text style={styles.headerSubtitle}>
            Showcase your work with video content
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!canUploadVideo() || uploading) && styles.uploadButtonDisabled,
          ]}
          onPress={handleFileSelect}
          disabled={!canUploadVideo() || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {uploading ? "Uploading…" : "Upload Videos"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressStatus}>{uploadStatus || "Uploading…"}</Text>
            <Text style={styles.progressPercent}>{uploadProgress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
          </View>
        </View>
      )}

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="videocam-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No Videos Yet</Text>
          <Text style={styles.emptyStateText}>Upload videos to showcase your work</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={handleFileSelect}
            disabled={uploading}
          >
            <Icon name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.emptyStateButtonText}>Upload Your First Videos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          scrollEnabled={false}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedVideo && (
              <WebView
                source={{ uri: getFullVideoUrl(selectedVideo.videoUrl || selectedVideo.url) }}
                style={styles.modalVideo}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onError={(error) => console.error('❌ Modal video error:', error.nativeEvent)}
                onLoadStart={() => console.log('🔄 Modal video loading started')}
                onLoadEnd={() => console.log('✅ Modal video loading finished')}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={upgradeModalVisible} transparent={true} animationType="fade" onRequestClose={() => setUpgradeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.upgradeModalContainer}>
            <TouchableOpacity style={styles.upgradeModalClose} onPress={() => setUpgradeModalVisible(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.upgradeModalIcon}>
              <Icon name="videocam-outline" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.upgradeModalTitle}>Upgrade Your Plan</Text>
            <Text style={styles.upgradeModalMessage}>
              Video uploads are not available in the Free Plan. Upgrade to Starter Plan (₹499) or higher to upload videos.
            </Text>
            <View style={styles.upgradeModalButtons}>
              <TouchableOpacity style={styles.upgradeModalCancelButton} onPress={() => setUpgradeModalVisible(false)}>
                <Text style={styles.upgradeModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.upgradeModalUpgradeButton} onPress={() => {
                setUpgradeModalVisible(false);
                navigation.navigate("Subscription");
              }}>
                <Text style={styles.upgradeModalUpgradeText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  planInfoBanner: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
  },
  planInfoBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfoBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  planInfoBannerText: {
    fontSize: 12,
    color: "#374151",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressStatus: {
    fontSize: 12,
    color: "#6B21A5",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B21A5",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E9D5FF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#7C3AED",
    borderRadius: 3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    marginHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  videoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  videoPlayerContainer: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  videoPlayer: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  durationText: {
    fontSize: 11,
    color: "#FFFFFF",
  },
  visibilityBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  visibilityText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pendingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  pendingText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  previewButton: {
    backgroundColor: "#EEF2FF",
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4F46E5",
  },
  publicButton: {
    backgroundColor: "#D1FAE5",
  },
  publicButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10B981",
  },
  hiddenButton: {
    backgroundColor: "#F3F4F6",
  },
  hiddenButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  deleteButton: {
    flex: 0.3,
    backgroundColor: "#FEE2E2",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width,
    height: height,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  modalVideo: {
    width: width,
    height: height - 100,
  },
  upgradeModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  upgradeModalClose: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  upgradeModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  upgradeModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  upgradeModalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  upgradeModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  upgradeModalCancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  upgradeModalUpgradeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
  },
  upgradeModalUpgradeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default VendorVideoManager;