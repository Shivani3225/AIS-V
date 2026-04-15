
// import React, { useState, useEffect, useRef } from "react";
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
//   Image,
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
//   const [videoDebugInfo, setVideoDebugInfo] = useState({});

//   // Refs for WebView controls
//   const webViewRefs = useRef({});

//   useEffect(() => {
//     console.log("🚀 Component Mounted");
//     console.log("📱 Platform:", Platform.OS);
//     console.log("📱 Platform Version:", Platform.Version);
//     fetchVideos();
//     requestStoragePermission();
//   }, []);

//   const requestStoragePermission = async () => {
//     if (Platform.OS === "android") {
//       try {
//         const permission = Platform.Version >= 33
//           ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
//           : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

//         console.log("🔐 Requesting permission:", permission);
//         const granted = await PermissionsAndroid.request(permission, {
//           title: "Storage Permission",
//           message: "App needs access to your storage to upload videos",
//           buttonNeutral: "Ask Me Later",
//           buttonNegative: "Cancel",
//           buttonPositive: "OK",
//         });

//         console.log("✅ Storage permission result:", granted);
//       } catch (err) {
//         console.error("❌ Storage permission error:", err);
//       }
//     }
//   };

//   const normalizeVideoUriForAndroid = async (uri) => {
//     console.log("📁 Normalizing URI:", uri);
//     if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
//       console.log("📁 No normalization needed");
//       return uri;
//     }

//     const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.mp4`;
//     console.log("📁 Destination path:", destPath);

//     try {
//       await RNFS.copyFile(uri, destPath);
//       console.log("✅ Copied to temp file:", destPath);
//       return destPath;
//     } catch (err) {
//       console.warn("⚠️ Copy failed, using original:", err);
//       return uri;
//     }
//   };

//   const fetchVideos = async () => {
//     try {
//       console.log("🔄 Fetching videos from API...");
//       setLoading(true);
//       const token = await AsyncStorage.getItem("vendorToken");
//       console.log("🔑 Token available:", token ? "Yes" : "No");

//       const response = await fetch(`${API_BASE_URL}/vendor-profile/dashboard/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("📡 API Response Status:", response.status);
//       const data = await response.json();
//       console.log("📦 API Response Data:", JSON.stringify(data, null, 2));

//       if (data.success) {
//         console.log("✅ Videos fetched successfully!");
//         console.log("📹 Total videos:", data.data.videos?.length || 0);
        
//         if (data.data.videos && data.data.videos.length > 0) {
//           console.log("\n========== VIDEO DEBUG INFO ==========");
//           data.data.videos.forEach((video, idx) => {
//             console.log(`\n📹 Video ${idx + 1}:`);
//             console.log(`  ID: ${video._id}`);
//             console.log(`  Original videoUrl: ${video.videoUrl}`);
//             console.log(`  Approval Status: ${video.approvalStatus}`);
//             console.log(`  Visibility: ${video.visibility}`);
//             console.log(`  Duration: ${video.duration}`);
            
//             const videoUrl = video.videoUrl || video.url;
//             if (videoUrl) {
//               console.log(`  Full URL: ${videoUrl}`);
//             }
//           });
//           console.log("=====================================\n");
//         }
        
//         setVideos(data.data.videos || []);
//         setLimits(data.data.limits);
//         setPlanType(data.data.planKey || "free");
//         setCurrentUsage(data.data.currentUsage || { portfolioCount: 0, videoCount: 0 });

//         const initialPlayingStates = {};
//         (data.data.videos || []).forEach((video) => {
//           initialPlayingStates[video._id] = true;
//         });
//         setPlayingStates(initialPlayingStates);
//       } else {
//         console.error("❌ API returned success: false", data);
//         setError("Failed to load videos");
//       }
//     } catch (error) {
//       console.error("❌ Fetch error details:", error);
//       setError("Failed to load videos");
//     } finally {
//       setLoading(false);
//       console.log("🏁 Fetch videos completed");
//     }
//   };

//   const canUploadVideo = () => {
//     if (!limits) return false;
//     if (!limits.allowVideos) return false;
//     if (limits.portfolioLimit === -1) return true;
//     return currentUsage.portfolioCount < limits.portfolioLimit;
//   };

//   const uploadVideo = async (videoUri, fileName, fileType) => {
//     console.log("📤 Starting upload...");
//     setUploadProgress(0);
    
//     try {
//       const token = await AsyncStorage.getItem('vendorToken');
      
//       if (!token) {
//         throw new Error('No authentication token found');
//       }
      
//       const uploadUri = await normalizeVideoUriForAndroid(videoUri);
//       const filePath = uploadUri.replace('file://', '');
      
//       const exists = await RNFS.exists(filePath);
//       if (!exists) {
//         throw new Error('File does not exist at path: ' + filePath);
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
//           console.log('✅ Upload began, jobId:', response.jobId);
//         },
//         progress: (response) => {
//           const progress = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
//           setUploadProgress(progress);
//           console.log('📊 Upload progress:', progress + '%');
//         },
//       }).promise;
      
//       console.log('📡 Upload result status code:', uploadResult.statusCode);
      
//       let data;
//       try {
//         data = JSON.parse(uploadResult.body);
//       } catch (e) {
//         data = { success: false, message: uploadResult.body };
//       }
      
//       setUploadProgress(100);
      
//       if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
//         if (data.success) {
//           console.log("✅ Upload successful!");
//           return data;
//         }
//       }
      
//       throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);
      
//     } catch (error) {
//       console.error('❌ Upload error details:', error);
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
//             if (uploadResult && uploadResult.success) {
//               await fetchVideos();
//               Alert.alert("Success", "Video uploaded successfully! It will be visible after admin approval.");
//             } else {
//               throw new Error(uploadResult?.message || "Upload failed");
//             }
//           } catch (error) {
//             const message = error?.message || String(error);
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
//       console.error("❌ Toggle error:", error);
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

//   const openVideoPreview = (video) => {
//     setSelectedVideo(video);
//     setModalVisible(true);
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

//   const getFullVideoUrl = (videoUrl) => {
//     if (!videoUrl) return null;
//     if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
//       return videoUrl.replace('http://', 'https://');
//     }
//     if (videoUrl.startsWith('/')) {
//       return `${API_BASE_URL}${videoUrl}`;
//     }
//     return `${API_BASE_URL}/${videoUrl}`;
//   };

//   // ============ RENDERITEM - No black borders for any video ============
//   const renderItem = ({ item, index }) => {
//     let videoUrl = item.videoUrl || item.url;
//     const isPending = item.approvalStatus === "pending";
//     const isHidden = item.visibility === "hidden";
//     const isApproved = item.approvalStatus === "approved";
    
//     // Generate thumbnail URL from video URL
//     let thumbnailUrl = videoUrl;
//     let optimizedUrl = videoUrl;
    
//     if (videoUrl) {
//       if (videoUrl.includes('cloudinary.com')) {
//         // For Cloudinary - get video thumbnail/poster
//         thumbnailUrl = videoUrl.replace('/upload/', '/upload/w_400,h_225,c_fill,q_auto,f_auto/');
//         optimizedUrl = videoUrl.replace('/upload/', '/upload/f_auto,q_auto,vc_auto/');
//       } else {
//         thumbnailUrl = videoUrl;
//         optimizedUrl = videoUrl;
//       }
//     }
    
//     // HTML with proper styling - NO BLACK BORDERS
//     const videoHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
//         <style>
//           * { 
//             margin: 0; 
//             padding: 0; 
//             box-sizing: border-box; 
//           }
//           html, body {
//             margin: 0;
//             padding: 0;
//             width: 100%;
//             height: 100%;
//             overflow: hidden;
//             background: #000;
//           }
//           body { 
//             background: #000; 
//             display: flex; 
//             justify-content: center; 
//             align-items: center; 
//             width: 100%; 
//             height: 100%; 
//           }
//           .video-container {
//             position: relative;
//             width: 100%;
//             height: 100%;
//             background: #000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//           }
//           video { 
//             width: 100%; 
//             height: 100%; 
//             object-fit: cover;
//             display: block;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="video-container">
//           <video 
//             id="videoPlayer" 
//             preload="metadata"
//             playsinline 
//             webkit-playsinline
//             poster="${thumbnailUrl}"
//           >
//             <source src="${optimizedUrl}" type="video/mp4">
//           </video>
//         </div>
//         <script>
//           var video = document.getElementById('videoPlayer');
//           video.addEventListener('loadedmetadata', function() {
//             video.currentTime = 0.1;
//           });
//           video.load();
//         </script>
//       </body>
//       </html>
//     `;

//     return (
//       <View style={styles.videoCard}>
//         <View style={styles.videoPlayerContainer}>
//           <WebView
//             ref={ref => webViewRefs.current[item._id] = ref}
//             source={{ html: videoHTML }}
//             style={styles.videoPlayer}
//             javaScriptEnabled={true}
//             domStorageEnabled={true}
//             allowsInlineMediaPlayback={true}
//             mediaPlaybackRequiresUserAction={true}
//             allowsFullscreenVideo={true}
//             onError={(error) => console.error(`❌ WebView error for ${item._id}:`, error.nativeEvent)}
//             scrollEnabled={false}
//             showsVerticalScrollIndicator={false}
//             showsHorizontalScrollIndicator={false}
//           />
          
//           {/* Play Overlay Button */}
//           <TouchableOpacity 
//             style={styles.playOverlay} 
//             onPress={() => openVideoPreview(item)} 
//             activeOpacity={0.8}
//           >
//             <Icon 
//               name="play-circle" 
//               size={50} 
//               color="#FFFFFF" 
//             />
//           </TouchableOpacity>

//           {/* Duration Badge */}
//           {item.duration > 0 && (
//             <View style={styles.durationBadge}>
//               <Icon name="time-outline" size={12} color="#FFFFFF" />
//               <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
//             </View>
//           )}

//           {/* Status Badge */}
//           <View style={[
//             styles.statusBadge,
//             isApproved ? styles.approvedBadge : styles.pendingBadge
//           ]}>
//             <Icon 
//               name={isApproved ? "checkmark-circle" : "time-outline"} 
//               size={12} 
//               color="#FFFFFF" 
//             />
//             <Text style={styles.statusText}>
//               {isApproved ? "Approved" : "Pending Approval"}
//             </Text>
//           </View>

//           {/* Visibility Badge */}
//           {item.visibility === "hidden" && (
//             <View style={styles.visibilityBadge}>
//               <Icon name="eye-off-outline" size={12} color="#FFFFFF" />
//               <Text style={styles.visibilityText}>Hidden</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.videoInfo}>
//           <Text style={styles.videoTitle}>Portfolio Video {index + 1}</Text>

//           <View style={styles.statsContainer}>
//             <Icon name="eye-outline" size={14} color="#6B7280" />
//             <Text style={styles.statText}>{formatViews(item.views || 0)} views</Text>
//           </View>

//           <View style={styles.actionButtons}>
//             <TouchableOpacity 
//               style={[styles.actionButton, styles.previewButton]} 
//               onPress={() => openVideoPreview(item)}
//             >
//               <Icon name="play-circle-outline" size={18} color="#4F46E5" />
//               <Text style={styles.previewButtonText}>Preview</Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.actionButton, item.visibility === "public" ? styles.publicButton : styles.hiddenButton]} 
//               onPress={() => toggleVisibility(item._id, item.visibility)}
//             >
//               <Icon name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"} size={18} color={item.visibility === "public" ? "#10B981" : "#6B7280"} />
//               <Text style={item.visibility === "public" ? styles.publicButtonText : styles.hiddenButtonText}>
//                 {item.visibility === "public" ? "Public" : "Hidden"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity 
//               style={[styles.actionButton, styles.deleteButton]} 
//               onPress={() => deleteVideo(item._id)}
//             >
//               <Icon name="trash-outline" size={18} color="#EF4444" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   };

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
//             Showcase your work with video 
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

//       {/* Preview Modal */}
//       <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
//               <Icon name="close" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//             {selectedVideo && (
//               <WebView
//                 source={{ 
//                   html: `
//                     <!DOCTYPE html>
//                     <html>
//                     <head>
//                       <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
//                       <style>
//                         * { margin: 0; padding: 0; box-sizing: border-box; }
//                         body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
//                         video { width: 100%; height: 100%; object-fit: contain; }
//                       </style>
//                     </head>
//                     <body>
//                       <video controls autoplay playsinline webkit-playsinline style="width:100%;height:100%;object-fit:contain;">
//                         <source src="${selectedVideo.videoUrl || selectedVideo.url}" type="video/mp4">
//                       </video>
//                       <script>
//                         var video = document.querySelector('video');
//                         video.play().catch(e => console.log('Autoplay prevented:', e));
//                       </script>
//                     </body>
//                     </html>
//                   `
//                 }}
//                 style={styles.modalVideo}
//                 javaScriptEnabled={true}
//                 domStorageEnabled={true}
//                 allowsInlineMediaPlayback={true}
//                 mediaPlaybackRequiresUserAction={false}
//                 allowsFullscreenVideo={true}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Upgrade Modal */}
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
//     paddingHorizontal: 10,
//     borderRadius: 10,
//     gap: 8,
//     marginLeft: 8,
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
//     width: "100%",
//     aspectRatio: 16 / 9,
//     backgroundColor: "#000",
//     overflow: "hidden",
//     position: "relative",
//   },
//   videoPlayer: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#000",
//   },
//   playOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//     zIndex: 10,
//   },
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
//   statusBadge: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     gap: 4,
//     zIndex: 2,
//   },
//   approvedBadge: {
//     backgroundColor: "rgba(16, 185, 129, 0.9)",
//   },
//   pendingBadge: {
//     backgroundColor: "rgba(245, 158, 11, 0.9)",
//   },
//   statusText: {
//     fontSize: 10,
//     color: "#FFFFFF",
//     fontWeight: "600",
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
import React, { useState, useEffect, useRef } from "react";
import { WebView } from 'react-native-webview';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Image,
  Animated,
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
  const [videoDebugInfo, setVideoDebugInfo] = useState({});
  
  // Message state
  const [message, setMessage] = useState({ visible: false, text: "", type: "success" });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Refs for WebView controls
  const webViewRefs = useRef({});

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setMessage({ ...message, visible: false });
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message.visible]);

  const showMessage = (text, type = "success") => {
    setMessage({ visible: true, text, type });
  };

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
        
        if (data.data.videos && data.data.videos.length > 0) {
          console.log("\n========== VIDEO DEBUG INFO ==========");
          data.data.videos.forEach((video, idx) => {
            console.log(`\n📹 Video ${idx + 1}:`);
            console.log(`  ID: ${video._id}`);
            console.log(`  Original videoUrl: ${video.videoUrl}`);
            console.log(`  Approval Status: ${video.approvalStatus}`);
            console.log(`  Visibility: ${video.visibility}`);
            console.log(`  Duration: ${video.duration}`);
            
            const videoUrl = video.videoUrl || video.url;
            if (videoUrl) {
              console.log(`  Full URL: ${videoUrl}`);
            }
          });
          console.log("=====================================\n");
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
        showMessage("Failed to load videos", "error");
      }
    } catch (error) {
      console.error("❌ Fetch error details:", error);
      setError("Failed to load videos");
      showMessage("Failed to load videos", "error");
    } finally {
      setLoading(false);
      console.log("🏁 Fetch videos completed");
    }
  };

  const canUploadVideo = () => {
    if (!limits) return false;
    if (!limits.allowVideos) return false;
    if (limits.portfolioLimit === -1) return true;
    return currentUsage.portfolioCount < limits.portfolioLimit;
  };

  const uploadVideo = async (videoUri, fileName, fileType) => {
    console.log("📤 Starting upload...");
    setUploadProgress(0);
    
    try {
      const token = await AsyncStorage.getItem('vendorToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const uploadUri = await normalizeVideoUriForAndroid(videoUri);
      const filePath = uploadUri.replace('file://', '');
      
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        throw new Error('File does not exist at path: ' + filePath);
      }
      
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
      
      let data;
      try {
        data = JSON.parse(uploadResult.body);
      } catch (e) {
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
      throw error;
    }
  };

  const handleFileSelect = async () => {
    const token = await AsyncStorage.getItem('vendorToken');
    if (!token) {
      showMessage("Please login as vendor first", "error");
      return;
    }

    if (!limits?.allowVideos) {
      showMessage("Video uploads are not available in the Free Plan", "error");
      setUpgradeModalVisible(true);
      return;
    }

    if (!canUploadVideo()) {
      showMessage(`Portfolio limit reached (${currentUsage.portfolioCount}/${limits.portfolioLimit} media used)`, "error");
      return;
    }

    launchImageLibrary(
      {
        mediaType: "video",
        quality: 0.8,
        videoQuality: "medium",
      },
      async (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          showMessage(response.errorMessage, "error");
          return;
        }

        if (response.assets && response.assets[0]) {
          const videoAsset = response.assets[0];
          const videoUri = videoAsset.uri;
          const fileType = videoAsset.type;
          const fileName = videoAsset.fileName || "video.mp4";
          const fileSize = videoAsset.fileSize || 0;

          const maxSize = 200 * 1024 * 1024;
          if (fileSize > maxSize) {
            showMessage("Video file exceeds 200MB limit", "error");
            return;
          }

          setUploading(true);
          setUploadProgress(0);
          setUploadStatus("Uploading video...");

          try {
            const uploadResult = await uploadVideo(videoUri, fileName, fileType);
            if (uploadResult && uploadResult.success) {
              await fetchVideos();
              showMessage("Video uploaded successfully! It will be visible after admin approval.", "success");
            } else {
              throw new Error(uploadResult?.message || "Upload failed");
            }
          } catch (error) {
            const message = error?.message || String(error);
            showMessage(message, "error");
          } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadStatus("");
          }
        }
      }
    );
  };

  const toggleVisibility = async (videoId, currentVisibility) => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const newVisibility = currentVisibility === "public" ? "hidden" : "public";

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
      if (data.success) {
        setVideos(
          videos.map((v) =>
            v._id === videoId ? { ...v, visibility: data.data?.visibility || data.visibility } : v
          )
        );
        showMessage(`Video is now ${data.data?.visibility || data.visibility}`, "success");
      }
    } catch (error) {
      console.error("❌ Toggle error:", error);
      showMessage("Failed to update visibility", "error");
    }
  };

  const deleteVideo = async (videoId) => {
    // For delete, we need confirmation - using custom modal or keep alert for confirmation
    // Since you want only non-alert messages, I'll implement a custom confirm dialog
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      const response = await fetch(`${API_BASE_URL}/vendor-profile/videos/${videoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setVideos(videos.filter((v) => v._id !== videoId));
        showMessage("Video deleted successfully!", "success");
      }
    } catch (error) {
      showMessage("Failed to delete video", "error");
    }
  };

  const openVideoPreview = (video) => {
    setSelectedVideo(video);
    setModalVisible(true);
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

  const getFullVideoUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl.replace('http://', 'https://');
    }
    if (videoUrl.startsWith('/')) {
      return `${API_BASE_URL}${videoUrl}`;
    }
    return `${API_BASE_URL}/${videoUrl}`;
  };

  // Custom confirm dialog for delete
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const confirmDelete = (videoId) => {
    setVideoToDelete(videoId);
    setConfirmModalVisible(true);
  };

  const handleDeleteConfirmed = async () => {
    if (videoToDelete) {
      await deleteVideo(videoToDelete);
      setConfirmModalVisible(false);
      setVideoToDelete(null);
    }
  };

  // ============ RENDERITEM - No black borders for any video ============
  const renderItem = ({ item, index }) => {
    let videoUrl = item.videoUrl || item.url;
    const isPending = item.approvalStatus === "pending";
    const isHidden = item.visibility === "hidden";
    const isApproved = item.approvalStatus === "approved";
    
    // Generate thumbnail URL from video URL
    let thumbnailUrl = videoUrl;
    let optimizedUrl = videoUrl;
    
    if (videoUrl) {
      if (videoUrl.includes('cloudinary.com')) {
        // For Cloudinary - get video thumbnail/poster
        thumbnailUrl = videoUrl.replace('/upload/', '/upload/w_400,h_225,c_fill,q_auto,f_auto/');
        optimizedUrl = videoUrl.replace('/upload/', '/upload/f_auto,q_auto,vc_auto/');
      } else {
        thumbnailUrl = videoUrl;
        optimizedUrl = videoUrl;
      }
    }
    
    // HTML with proper styling - NO BLACK BORDERS
    const videoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
          }
          body { 
            background: #000; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            width: 100%; 
            height: 100%; 
          }
          .video-container {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          video { 
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <video 
            id="videoPlayer" 
            preload="metadata"
            playsinline 
            webkit-playsinline
            poster="${thumbnailUrl}"
          >
            <source src="${optimizedUrl}" type="video/mp4">
          </video>
        </div>
        <script>
          var video = document.getElementById('videoPlayer');
          video.addEventListener('loadedmetadata', function() {
            video.currentTime = 0.1;
          });
          video.load();
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.videoCard}>
        <View style={styles.videoPlayerContainer}>
          <WebView
            ref={ref => webViewRefs.current[item._id] = ref}
            source={{ html: videoHTML }}
            style={styles.videoPlayer}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={true}
            allowsFullscreenVideo={true}
            onError={(error) => console.error(`❌ WebView error for ${item._id}:`, error.nativeEvent)}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
          
          {/* Play Overlay Button */}
          <TouchableOpacity 
            style={styles.playOverlay} 
            onPress={() => openVideoPreview(item)} 
            activeOpacity={0.8}
          >
            <Icon 
              name="play-circle" 
              size={50} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>

          {/* Duration Badge */}
          {item.duration > 0 && (
            <View style={styles.durationBadge}>
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
            </View>
          )}

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            isApproved ? styles.approvedBadge : styles.pendingBadge
          ]}>
            <Icon 
              name={isApproved ? "checkmark-circle" : "time-outline"} 
              size={12} 
              color="#FFFFFF" 
            />
            <Text style={styles.statusText}>
              {isApproved ? "Approved" : "Pending Approval"}
            </Text>
          </View>

          {/* Visibility Badge */}
          {item.visibility === "hidden" && (
            <View style={styles.visibilityBadge}>
              <Icon name="eye-off-outline" size={12} color="#FFFFFF" />
              <Text style={styles.visibilityText}>Hidden</Text>
            </View>
          )}
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>Portfolio Video {index + 1}</Text>

          <View style={styles.statsContainer}>
            <Icon name="eye-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{formatViews(item.views || 0)} views</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.previewButton]} 
              onPress={() => openVideoPreview(item)}
            >
              <Icon name="play-circle-outline" size={18} color="#4F46E5" />
              <Text style={styles.previewButtonText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, item.visibility === "public" ? styles.publicButton : styles.hiddenButton]} 
              onPress={() => toggleVisibility(item._id, item.visibility)}
            >
              <Icon name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"} size={18} color={item.visibility === "public" ? "#10B981" : "#6B7280"} />
              <Text style={item.visibility === "public" ? styles.publicButtonText : styles.hiddenButtonText}>
                {item.visibility === "public" ? "Public" : "Hidden"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => confirmDelete(item._id)}
            >
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
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Custom Message Toast */}
        {message.visible && (
          <Animated.View 
            style={[
              styles.messageContainer,
              message.type === "success" ? styles.messageSuccess : styles.messageError,
              { opacity: fadeAnim }
            ]}
          >
            <Icon 
              name={message.type === "success" ? "checkmark-circle" : "alert-circle"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.messageText}>{message.text}</Text>
          </Animated.View>
        )}

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
              Showcase your work with video 
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

        {/* Preview Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              {selectedVideo && (
                <WebView
                  source={{ 
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
                        <style>
                          * { margin: 0; padding: 0; box-sizing: border-box; }
                          body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
                          video { width: 100%; height: 100%; object-fit: contain; }
                        </style>
                      </head>
                      <body>
                        <video controls autoplay playsinline webkit-playsinline style="width:100%;height:100%;object-fit:contain;">
                          <source src="${selectedVideo.videoUrl || selectedVideo.url}" type="video/mp4">
                        </video>
                        <script>
                          var video = document.querySelector('video');
                          video.play().catch(e => console.log('Autoplay prevented:', e));
                        </script>
                      </body>
                      </html>
                    `
                  }}
                  style={styles.modalVideo}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsInlineMediaPlayback={true}
                  mediaPlaybackRequiresUserAction={false}
                  allowsFullscreenVideo={true}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Upgrade Modal */}
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

        {/* Custom Confirm Delete Modal */}
        <Modal visible={confirmModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.upgradeModalContainer}>
              <View style={[styles.upgradeModalIcon, { backgroundColor: "#FEE2E2" }]}>
                <Icon name="trash-outline" size={48} color="#EF4444" />
              </View>
              <Text style={styles.upgradeModalTitle}>Delete Video</Text>
              <Text style={styles.upgradeModalMessage}>
                Are you sure you want to delete this video? This action cannot be undone.
              </Text>
              <View style={styles.upgradeModalButtons}>
                <TouchableOpacity style={styles.upgradeModalCancelButton} onPress={() => setConfirmModalVisible(false)}>
                  <Text style={styles.upgradeModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.upgradeModalUpgradeButton, { backgroundColor: "#EF4444" }]} onPress={handleDeleteConfirmed}>
                  <Text style={styles.upgradeModalUpgradeText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
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
  messageContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageSuccess: {
    backgroundColor: "#10B981",
  },
  messageError: {
    backgroundColor: "#EF4444",
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
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
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 8,
    marginLeft: 8,
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
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
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
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    zIndex: 2,
  },
  approvedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  pendingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.9)",
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
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