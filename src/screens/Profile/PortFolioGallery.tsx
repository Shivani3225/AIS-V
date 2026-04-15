// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   FlatList,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNavigation } from "@react-navigation/native";
// import { launchImageLibrary } from "react-native-image-picker";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import RNFS from "react-native-fs";

// const BASE_URL = 'https://api.aissignatureevent.com/api';

// const PortFolioGallery = () => {
//   const navigation = useNavigation();
//   const [media, setMedia] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState("");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [limits, setLimits] = useState(null);
//   const [planType, setPlanType] = useState("free");
//   const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0 });
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     requestStoragePermission();
//     checkAuthAndFetch();
//   }, []);

//   const requestStoragePermission = async () => {
//     if (Platform.OS === "android") {
//       try {
//         const permission = Platform.Version >= 33
//           ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
//           : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

//         const granted = await PermissionsAndroid.request(permission, {
//           title: "Storage Permission",
//           message: "App needs access to your storage to upload images",
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

//   // Helper function to get auth token
//   const getAuthToken = async () => {
//     try {
//       const token = await AsyncStorage.getItem("vendorToken");
//       if (token) {
//         console.log("✅ Token found, length:", token.length);
//         return token;
//       }
//       console.log("❌ No auth token found");
//       return null;
//     } catch (error) {
//       console.error("Error getting token:", error);
//       return null;
//     }
//   };

//   const checkAuthAndFetch = async () => {
//     const token = await getAuthToken();
//     if (!token) {
//       Alert.alert(
//         "Authentication Required",
//         "Please login to view your portfolio",
//         [
//           {
//             text: "Login",
//             onPress: () => navigation.replace("Login")
//           }
//         ]
//       );
//       setLoading(false);
//       return;
//     }
//     fetchMedia();
//   };

//   const fetchMedia = async () => {
//     try {
//       setLoading(true);
//       const token = await getAuthToken();
      
//       const response = await axios({
//         method: 'GET',
//         url: `${BASE_URL}/vendor-profile/dashboard/me`,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (response.data.success) {
//         // Filter to only show IMAGES (exclude videos)
//         const imagesOnly = (response.data.data.media || []).filter(
//           (item) => item.type === "image"
//         );
//         setMedia(imagesOnly);
//         setLimits(response.data.data.limits);
//         setPlanType(response.data.data.planKey || "free");
//         setCurrentUsage(response.data.data.currentUsage || { portfolioCount: 0 });
        
//         console.log("Images loaded:", imagesOnly.length);
//       } else {
//         console.error("Response success false:", response.data);
//         Alert.alert("Error", response.data.message || "Failed to load media");
//       }
//     } catch (error) {
//       console.error("Fetch media error:", error);
//       Alert.alert("Error", "Failed to load media");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRemainingUploads = () => {
//     if (!limits) return 0;
//     if (limits.portfolioLimit === -1) return Infinity;
//     return Math.max(0, limits.portfolioLimit - currentUsage.portfolioCount);
//   };

//   const canUpload = () => {
//     const remaining = getRemainingUploads();
//     return remaining === Infinity || remaining > 0;
//   };

//   // Normalize image URI for Android
//   const normalizeImageUriForAndroid = async (uri) => {
//     if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
//       return uri;
//     }

//     const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.jpg`;

//     try {
//       await RNFS.copyFile(uri, destPath);
//       console.log("Copied to temp file:", destPath);
//       return destPath;
//     } catch (err) {
//       console.warn("Copy failed, using original:", err);
//       return uri;
//     }
//   };

//   // Function to get file type/mime type
//   const getFileType = (fileName) => {
//     const extension = fileName?.split('.').pop()?.toLowerCase() || '';
//     const mimeTypes = {
//       'jpg': 'image/jpeg',
//       'jpeg': 'image/jpeg',
//       'png': 'image/png',
//       'gif': 'image/gif',
//       'webp': 'image/webp',
//       'heic': 'image/heic',
//       'heif': 'image/heif',
//     };
//     return mimeTypes[extension] || 'image/jpeg';
//   };

//   // Enhanced function to log image details
//   const logImageDetails = async (file, fileInfo = null) => {
//     console.log('\n========== 📸 IMAGE DETAILS ==========');
//     console.log('📁 File Name:', file.fileName || file.name || 'Unknown');
//     console.log('📏 File Size:', file.fileSize ? `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB (${file.fileSize} bytes)` : 'Unknown');
//     console.log('🎨 File Type/Extension:', file.type || file.fileName?.split('.').pop() || 'Unknown');
//     console.log('🖼️ MIME Type:', file.type || getFileType(file.fileName));
//     console.log('📍 File URI:', file.uri);
    
//     if (file.width && file.height) {
//       console.log('📐 Dimensions:', `${file.width} x ${file.height} pixels`);
//     }
    
//     if (fileInfo) {
//       console.log('💾 Actual File Size (RNFS):', `${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB (${fileInfo.size} bytes)`);
//     }
    
//     console.log('==========================================\n');
//   };

//   // Upload single image using RNFS
//  // Replace the uploadSingleImage function with this corrected version:

// const uploadSingleImage = async (file, attempt = 1) => {
//   try {
//     const token = await getAuthToken();
    
//     if (!token) {
//       throw new Error("No token found");
//     }
    
//     // Log detailed image information before upload
//     await logImageDetails(file);
    
//     // Get the actual file path correctly
//     let filePath = file.uri;
    
//     // Remove file:// prefix if present
//     if (filePath.startsWith('file://')) {
//       filePath = filePath.replace('file://', '');
//     }
    
//     // For Android content:// URIs, we need to copy to a temporary file
//     if (Platform.OS === "android" && filePath.startsWith("content://")) {
//       const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}_${file.fileName || 'image.jpg'}`;
      
//       console.log(`📋 Copying content URI to temp file: ${destPath}`);
      
//       try {
//         await RNFS.copyFile(filePath, destPath);
//         filePath = destPath;
//         console.log(`✅ Successfully copied to: ${filePath}`);
//       } catch (copyError) {
//         console.error(`❌ Failed to copy file: ${copyError}`);
//         throw new Error(`Failed to process image file: ${copyError.message}`);
//       }
//     }
    
//     // Verify file exists
//     const exists = await RNFS.exists(filePath);
//     if (!exists) {
//       throw new Error(`File does not exist at path: ${filePath}`);
//     }
    
//     // Get file stats for detailed size information
//     const fileInfo = await RNFS.stat(filePath);
//     console.log(`📊 File Stats - Size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB, Path: ${filePath}`);
    
//     // Log again with actual file info
//     await logImageDetails(file, fileInfo);
    
//     const fileName = file.fileName || file.name || `photo_${Date.now()}.jpg`;
//     const mimeType = file.type || getFileType(fileName);
    
//     console.log(`🚀 Starting upload for: ${fileName}`);
//     console.log(`📤 Local file path: ${filePath}`);
//     console.log(`📤 MIME Type being sent: ${mimeType}`);
//     console.log(`📤 Upload URL: ${BASE_URL}/vendor-profile/media`);
    
//     // Upload using RNFS - IMPORTANT: Use the correct API
//     const uploadResult = await RNFS.uploadFiles({
//       toUrl: `${BASE_URL}/vendor-profile/media`,
//       files: [
//         {
//           name: 'file',
//           filename: fileName,
//           filepath: filePath,  // This must be a LOCAL file path, not a URL
//           filetype: mimeType,
//         },
//       ],
//       fields: {
//         type: 'image',
//       },
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Accept': 'application/json',
//       },
//       begin: (response) => {
//         console.log('📡 Upload began with jobId:', response.jobId);
//       },
//       progress: (response) => {
//         const progress = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
//         const sentMB = (response.totalBytesSent / (1024 * 1024)).toFixed(2);
//         const totalMB = (response.totalBytesExpectedToSend / (1024 * 1024)).toFixed(2);
//         console.log(`📊 Upload progress: ${progress}% (${sentMB} MB / ${totalMB} MB)`);
//       },
//     }).promise;
    
//     console.log('✅ Upload result status:', uploadResult.statusCode);
//     console.log('📦 Upload result body:', uploadResult.body);
    
//     // Clean up temp file if we created one
//     if (filePath.includes(RNFS.TemporaryDirectoryPath)) {
//       try {
//         await RNFS.unlink(filePath);
//         console.log('🧹 Temp file cleaned up:', filePath);
//       } catch (cleanupError) {
//         console.warn('Failed to clean up temp file:', cleanupError);
//       }
//     }
    
//     let data;
//     try {
//       data = JSON.parse(uploadResult.body);
//     } catch (e) {
//       console.error('Failed to parse response:', e);
//       data = { success: false, message: uploadResult.body };
//     }
    
//     if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
//       if (data.success) {
//         console.log(`🎉 Upload successful! File: ${fileName}, Size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB, Type: ${mimeType}`);
//         return { success: true, data };
//       } else {
//         throw new Error(data.message || 'Upload failed: Server returned success=false');
//       }
//     } else {
//       throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);
//     }
    
//   } catch (err) {
//     console.log(`❌ Upload failed (attempt ${attempt}):`, err.message);
//     console.log(`❌ Error details:`, err);
    
//     if (attempt < 3) {
//       console.log(`🔄 Retrying upload (${attempt + 1}/3)...`);
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       return uploadSingleImage(file, attempt + 1);
//     }
    
//     return { success: false, reason: err.message };
//   }
// };

// // Also update the normalizeImageUriForAndroid function (can be removed since we handle it in uploadSingleImage now)
// // But keep it for compatibility or remove it entirely

//   const pickImage = () => {
//     if (!canUpload()) {
//       Alert.alert(
//         "Limit Reached",
//         `Portfolio limit reached. Upgrade your plan for more storage.`
//       );
//       return;
//     }

//     launchImageLibrary(
//       {
//         mediaType: "photo",
//         selectionLimit: 5, // Allow multiple images
//         quality: 0.8,
//         includeBase64: false,
//       },
//       async (response) => {
//         if (response.didCancel) {
//           console.log("📱 User cancelled image selection");
//           return;
//         }

//         if (response.errorCode) {
//           console.error("❌ Image picker error:", response.errorMessage);
//           Alert.alert("Error", response.errorMessage);
//           return;
//         }

//         if (response.assets && response.assets.length > 0) {
//           console.log(`\n🖼️ Selected ${response.assets.length} image(s) for upload\n`);
          
//           // Log each selected image details
//           response.assets.forEach((asset, index) => {
//             console.log(`📸 Image ${index + 1} Details:`);
//             console.log(`   Name: ${asset.fileName || 'Unknown'}`);
//             console.log(`   Size: ${asset.fileSize ? (asset.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}`);
//             console.log(`   Type: ${asset.type || asset.fileName?.split('.').pop() || 'Unknown'}`);
//             console.log(`   Dimensions: ${asset.width || 'Unknown'} x ${asset.height || 'Unknown'}`);
//             console.log(`   URI: ${asset.uri}\n`);
//           });
          
//           // Filter only images and check file size
//           const validFiles = [];
//           const errors = [];

//           for (const asset of response.assets) {
//             // Check file size (10 MB limit)
//             if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
//               console.log(`⚠️ File too large: ${asset.fileName || "Image"} - ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB exceeds 10 MB limit`);
//               errors.push(`${asset.fileName || "Image"}: Exceeds 10 MB limit`);
//               continue;
//             }
//             console.log(`✅ File valid: ${asset.fileName || "Image"} - ${asset.fileSize ? (asset.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Size unknown'}`);
//             validFiles.push(asset);
//           }

//           // Cap at remaining quota
//           const remaining = getRemainingUploads();
//           const toUpload = remaining === Infinity ? validFiles : validFiles.slice(0, remaining);
//           const skippedByLimit = validFiles.length - toUpload.length;

//           if (skippedByLimit > 0) {
//             console.log(`⚠️ Skipped ${skippedByLimit} file(s) due to plan limit (Remaining: ${remaining === Infinity ? 'Unlimited' : remaining})`);
//           }

//           if (toUpload.length === 0) {
//             if (errors.length > 0) {
//               Alert.alert("Upload Failed", errors.join("\n"));
//             } else {
//               Alert.alert(
//                 "Limit Reached",
//                 "Portfolio limit reached. Upgrade your plan for more storage."
//               );
//             }
//             return;
//           }

//           console.log(`\n📤 Preparing to upload ${toUpload.length} file(s) out of ${validFiles.length} valid file(s)\n`);
//           await uploadImages(toUpload, skippedByLimit, errors);
//         }
//       }
//     );
//   };

//   const uploadImages = async (filesToUpload, skippedByLimit, errors) => {
//     if (!filesToUpload.length) return;
    
//     setUploading(true);
//     let successCount = 0;
//     const failedFiles = [...errors];
    
//     console.log(`\n🚀 ========== STARTING BATCH UPLOAD ==========`);
//     console.log(`📊 Total files to upload: ${filesToUpload.length}`);
//     console.log(`🎯 Remaining quota: ${getRemainingUploads() === Infinity ? 'Unlimited' : getRemainingUploads()}\n`);
    
//     // Upload one by one
//     for (let i = 0; i < filesToUpload.length; i++) {
//       const file = filesToUpload[i];
//       const fileSizeMB = file.fileSize ? (file.fileSize / (1024 * 1024)).toFixed(2) : 'Unknown';
//       const fileType = file.type || file.fileName?.split('.').pop() || 'Unknown';
      
//       console.log(`\n📤 ===== UPLOADING FILE ${i + 1}/${filesToUpload.length} =====`);
//       console.log(`📁 File: ${file.fileName || 'Unknown'}`);
//       console.log(`📏 Size: ${fileSizeMB} MB`);
//       console.log(`🎨 Type: ${fileType}`);
//       console.log(`📐 Dimensions: ${file.width || 'Unknown'} x ${file.height || 'Unknown'}`);
      
//       setUploadProgress(`${i + 1} / ${filesToUpload.length}`);
      
//       const result = await uploadSingleImage(file);
      
//       if (result.success) {
//         successCount++;
//         console.log(`✅ SUCCESS! (${successCount}/${filesToUpload.length}) - File: ${file.fileName}`);
//       } else {
//         failedFiles.push(`${file.fileName || "Image"}: ${result.reason}`);
//         console.log(`❌ FAILED! - File: ${file.fileName || 'Unknown'}, Reason: ${result.reason}`);
//       }
      
//       // Add delay between uploads
//       if (i < filesToUpload.length - 1) {
//         console.log(`⏳ Waiting 1.5 seconds before next upload...\n`);
//         await new Promise(resolve => setTimeout(resolve, 1500));
//       }
//     }
    
//     console.log(`\n📊 ========== UPLOAD SUMMARY ==========`);
//     console.log(`✅ Successful uploads: ${successCount}`);
//     console.log(`❌ Failed uploads: ${failedFiles.length}`);
//     console.log(`⚠️ Skipped due to limit: ${skippedByLimit}`);
//     console.log(`📁 Total files processed: ${filesToUpload.length + skippedByLimit}`);
//     console.log(`=====================================\n`);
    
//     // Refresh media after uploads
//     await fetchMedia();
    
//     // Show result message
//     let message = "";
//     if (successCount > 0) {
//       message += `✅ ${successCount} file${successCount > 1 ? "s" : ""} uploaded — pending admin approval.\n\n`;
//     }
//     if (failedFiles.length > 0) {
//       message += `❌ ${failedFiles.length} failed to upload.\n`;
//       message += `Failed:\n${failedFiles.slice(0, 3).join("\n")}`;
//       if (failedFiles.length > 3) {
//         message += `\n...and ${failedFiles.length - 3} more`;
//       }
//     }
    
//     if (skippedByLimit > 0) {
//       message += `\n\n⚠️ ${skippedByLimit} file${skippedByLimit > 1 ? "s were" : " was"} skipped due to plan limit.`;
//     }
    
//     Alert.alert("Upload Complete", message || "No files uploaded");
//     setUploading(false);
//     setUploadProgress("");
//   };

//   const handleDelete = async (mediaId) => {
//     Alert.alert(
//       "Delete Media",
//       "Are you sure you want to delete this media?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await getAuthToken();
//               await axios({
//                 method: 'DELETE',
//                 url: `${BASE_URL}/vendor-profile/media/${mediaId}`,
//                 headers: {
//                   'Authorization': `Bearer ${token}`,
//                 },
//               });
//               await fetchMedia();
//               Alert.alert("Success", "Media deleted successfully");
//             } catch (error) {
//               console.error("Delete error:", error);
//               Alert.alert("Error", "Failed to delete media");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleToggleVisibility = async (mediaId) => {
//     try {
//       const token = await getAuthToken();
//       const response = await axios({
//         method: 'PATCH',
//         url: `${BASE_URL}/vendor-profile/media/${mediaId}/toggle-visibility`,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
//       if (response.data.success) {
//         setMedia(media.map((m) => (m._id === mediaId ? response.data.data : m)));
//         Alert.alert("Success", `Visibility updated to ${response.data.data.visibility}`);
//       }
//     } catch (error) {
//       console.error("Toggle visibility error:", error);
//       Alert.alert("Error", "Failed to update visibility");
//     }
//   };

//   const handleToggleFeatured = async (mediaId) => {
//     try {
//       const token = await getAuthToken();
//       const response = await axios({
//         method: 'PATCH',
//         url: `${BASE_URL}/vendor-profile/media/${mediaId}/feature`,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
//       if (response.data.success) {
//         setMedia(media.map((m) => (m._id === mediaId ? response.data.data : m)));
//         Alert.alert("Success", response.data.data.isFeatured ? "Marked as featured" : "Removed from featured");
//       }
//     } catch (error) {
//       console.error("Toggle featured error:", error);
//       Alert.alert("Error", "Failed to update featured status");
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (!bytes || isNaN(bytes)) return null;
//     const mb = bytes / (1024 * 1024);
//     return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
//   };

//   const StatusBadge = ({ status }) => {
//     const getStatusStyle = () => {
//       switch (status) {
//         case "approved":
//           return styles.statusApproved;
//         case "rejected":
//           return styles.statusRejected;
//         default:
//           return styles.statusPending;
//       }
//     };

//     const getStatusText = () => {
//       switch (status) {
//         case "approved":
//           return "✓ Approved";
//         case "rejected":
//           return "✗ Rejected";
//         default:
//           return "⏳ Pending";
//       }
//     };

//     return (
//       <View style={[styles.statusBadge, getStatusStyle()]}>
//         <Text style={styles.statusText}>{getStatusText()}</Text>
//       </View>
//     );
//   };

//   const renderItem = ({ item, index }) => {
//     const displayCaption = `Portfolio Image ${index + 1}`;
//     const fileSize = formatFileSize(item.metadata?.size);

//     return (
//       <View style={styles.imageWrapper}>
//         <TouchableOpacity
//           onPress={() => {
//             setSelectedImage(item);
//             setModalVisible(true);
//           }}
//           activeOpacity={0.9}
//         >
//           <Image source={{ uri: item.url }} style={styles.galleryImage} />
//         </TouchableOpacity>

//         {/* Status Badge */}
//         <View style={styles.statusContainer}>
//           <StatusBadge status={item.approvalStatus} />
//         </View>

//         {/* Featured Badge */}
//         {item.isFeatured && (
//           <View style={styles.featuredBadge}>
//             <Icon name="star" size={12} color="#fff" />
//             <Text style={styles.featuredText}>Featured</Text>
//           </View>
//         )}

//         {/* Hidden Badge */}
//         {item.visibility === "hidden" && (
//           <View style={styles.hiddenBadge}>
//             <Icon name="eye-off" size={12} color="#fff" />
//             <Text style={styles.hiddenText}>Hidden</Text>
//           </View>
//         )}

//         <View style={styles.imageInfo}>
//           <Text style={styles.imageCaption} numberOfLines={1}>
//             {displayCaption}
//           </Text>
//           {fileSize && <Text style={styles.imageSize}>{fileSize}</Text>}
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.viewButton}
//             onPress={() => {
//               setSelectedImage(item);
//               setModalVisible(true);
//             }}
//           >
//             <Icon name="eye-outline" size={16} color="#4f46e5" />
//             <Text style={styles.viewButtonText}>View</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.visibilityButton,
//               item.visibility === "public"
//                 ? styles.publicButton
//                 : styles.hiddenButton,
//             ]}
//             onPress={() => handleToggleVisibility(item._id)}
//           >
//             <Icon
//               name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"}
//               size={16}
//               color={item.visibility === "public" ? "#059669" : "#6b7280"}
//             />
//             <Text
//               style={[
//                 styles.visibilityButtonText,
//                 item.visibility === "public"
//                   ? styles.publicText
//                   : styles.hiddenButtonText,
//               ]}
//             >
//               {item.visibility === "public" ? "Public" : "Hidden"}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => handleDelete(item._id)}
//           >
//             <Icon name="trash-outline" size={16} color="#dc2626" />
//             <Text style={[styles.viewButtonText,{color : '#dc2626'}]}>Delete</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[
//             styles.featuredButton,
//             item.isFeatured && styles.featuredButtonActive,
//           ]}
//           onPress={() => handleToggleFeatured(item._id)}
//         >
//           <Icon
//             name={item.isFeatured ? "star" : "star-outline"}
//             size={16}
//             color={item.isFeatured ? "#f59e0b" : "#6b7280"}
//           />
//           <Text
//             style={[
//               styles.featuredButtonText,
//               item.isFeatured && styles.featuredButtonTextActive,
//             ]}
//           >
//             {item.isFeatured ? "Featured" : "Mark as Featured"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const uploadLabel = uploading
//     ? `Uploading ${uploadProgress}…`
//     : !canUpload()
//     ? "Limit Reached"
//     : "Upload Photos";

//   return (
//     <View style={styles.container}>
//       {/* Plan Card */}
//       {limits && (
//         <View
//           style={[
//             styles.planCard,
//             limits.portfolioLimit === -1
//               ? styles.unlimitedPlanCard
//               : getRemainingUploads() === 0
//               ? styles.limitReachedPlanCard
//               : getRemainingUploads() <= 2
//               ? styles.lowLimitPlanCard
//               : styles.normalPlanCard,
//           ]}
//         >
//           <View style={styles.planInfo}>
//             <Text style={styles.planText}>
//               {limits.planName} {limits.planPrice && `(${limits.planPrice})`}
//             </Text>
//             <Text style={styles.usageText}>
//               {limits.portfolioLimit === -1 ? (
//                 <Text>
//                   <Icon name="infinite" size={14} color="#7c3aed" /> Unlimited
//                   portfolio uploads
//                 </Text>
//               ) : (
//                 <Text>
//                   <Text style={styles.boldText}>{currentUsage.portfolioCount}</Text> of{" "}
//                   <Text style={styles.boldText}>{limits.portfolioLimit}</Text> media used
//                   {getRemainingUploads() > 0 && (
//                     <Text style={styles.remainingText}>
//                       {" "}({getRemainingUploads()} remaining)
//                     </Text>
//                   )}
//                 </Text>
//               )}
//             </Text>
//             <Text style={styles.infoText}>
//               📷 Photos only (images: JPG, PNG, etc.) · Videos go in "Video Content" section · All uploads require admin approval
//             </Text>
//           </View>

//           {getRemainingUploads() === 0 && (
//             <TouchableOpacity style={styles.upgradeButton}>
//               <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       {/* Gallery Card */}
//       <View style={styles.galleryCard}>
//         <View style={styles.galleryHeader}>
//           <View>
//             <Text style={styles.galleryTitle}>Portfolio Photos</Text>
//             <Text style={styles.galleryCount}>
//               {media.length} photo{media.length !== 1 ? "s" : ""} · Images only
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={[
//               styles.uploadButton,
//               (!canUpload() || uploading) && styles.uploadButtonDisabled,
//             ]}
//             onPress={pickImage}
//             disabled={!canUpload() || uploading}
//           >
//             {uploading ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Icon name="cloud-upload-outline" size={18} color="#fff" />
//             )}
//             <Text style={styles.uploadText}>{uploadLabel}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tip Box */}
//         <View style={styles.tipContainer}>
//           <Icon name="information-circle-outline" size={20} color="#3b82f6" />
//           <Text style={styles.tipText}>
//             Tip: You can select multiple files at once. New uploads are pending admin approval before appearing publicly.
//           </Text>
//         </View>

//         {/* Loading State */}
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#7c3aed" />
//             <Text style={styles.loadingText}>Loading media…</Text>
//           </View>
//         ) : media.length > 0 ? (
//           <FlatList
//             data={media}
//             renderItem={renderItem}
//             keyExtractor={(item) => item._id}
//             numColumns={2}
//             columnWrapperStyle={styles.columnWrapper}
//             contentContainerStyle={styles.gridContainer}
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Icon name="images-outline" size={64} color="#d1d5db" />
//             <Text style={styles.emptyTitle}>No photos uploaded yet</Text>
//             <Text style={styles.emptyText}>
//               Upload photos to build your portfolio. You can select multiple files at once.
//             </Text>
//             <TouchableOpacity style={styles.emptyUploadButton} onPress={pickImage}>
//               <Icon name="cloud-upload-outline" size={20} color="#fff" />
//               <Text style={styles.emptyUploadText}>Upload Your First Photo</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* Image Preview Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Icon name="close" size={24} color="#fff" />
//             </TouchableOpacity>
//             {selectedImage && (
//               <Image
//                 source={{ uri: selectedImage.url }}
//                 style={styles.modalImage}
//                 resizeMode="contain"
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFF",
//   },
//   planCard: {
//     margin: 16,
//     padding: 16,
//     borderRadius: 16,
//     elevation: 3,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   unlimitedPlanCard: {
//     backgroundColor: "#f5f3ff",
//     borderWidth: 2,
//     borderColor: "#c4b5fd",
//   },
//   limitReachedPlanCard: {
//     backgroundColor: "#fef2f2",
//     borderWidth: 2,
//     borderColor: "#fecaca",
//   },
//   lowLimitPlanCard: {
//     backgroundColor: "#fffbeb",
//     borderWidth: 2,
//     borderColor: "#fed7aa",
//   },
//   normalPlanCard: {
//     backgroundColor: "#eff6ff",
//     borderWidth: 2,
//     borderColor: "#bfdbfe",
//   },
//   planInfo: {
//     flex: 1,
//   },
//   planText: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   usageText: {
//     fontSize: 13,
//     color: "#6b7280",
//     marginBottom: 4,
//   },
//   boldText: {
//     fontWeight: "700",
//     color: "#374151",
//   },
//   remainingText: {
//     color: "#059669",
//   },
//   infoText: {
//     fontSize: 11,
//     color: "#6b7280",
//     marginTop: 4,
//   },
//   upgradeButton: {
//     backgroundColor: "#7c3aed",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   upgradeButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 12,
//   },
//   galleryCard: {
//     backgroundColor: "#ffffff",
//     margin: 16,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 4,
//     flex: 1,
//   },
//   galleryHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   galleryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1f2937",
//   },
//   galleryCount: {
//     color: "#8E8E93",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   uploadButton: {
//     backgroundColor: "#7C3AED",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#d1d5db",
//   },
//   uploadText: {
//     color: "#fff",
//     marginLeft: 8,
//     fontWeight: "600",
//     fontSize: 13,
//   },
//   tipContainer: {
//     flexDirection: "row",
//     backgroundColor: "#EFF6FF",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   tipText: {
//     marginLeft: 8,
//     color: "#2563EB",
//     fontSize: 12,
//     flex: 1,
//     lineHeight: 18,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ffff',
//   },
//   loadingText: {
//     marginTop: 12,
//     color: "#6b7280",
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//   },
//   gridContainer: {
//     paddingBottom: 20,
//   },
//   imageWrapper: {
//     width: "48%",
//     marginBottom: 16,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   galleryImage: {
//     width: "100%",
//     height: 150,
//     backgroundColor: "#f3f4f6",
//   },
//   statusContainer: {
//     position: "absolute",
//     top: 8,
//     left: 8,
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusApproved: {
//     backgroundColor: "#10b981",
//   },
//   statusRejected: {
//     backgroundColor: "#ef4444",
//   },
//   statusPending: {
//     backgroundColor: "#f59e0b",
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   featuredBadge: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     backgroundColor: "#f59e0b",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   featuredText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   hiddenBadge: {
//     position: "absolute",
//     bottom: 8,
//     right: 8,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   hiddenText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   imageInfo: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f3f4f6",
//   },
//   imageCaption: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   imageSize: {
//     fontSize: 10,
//     color: "#9ca3af",
//     marginTop: 2,
//   },
//   actionButtons: {
//     flexDirection: "column",
//     padding: 8,
//     gap: 6,
//   },
//   viewButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#eef2ff",
//     paddingVertical: 6,
//     borderRadius: 6,
//     gap: 4,
//   },
//   viewButtonText: {
//     fontSize: 11,
//     fontWeight: "500",
//     color: "#4f46e5",
//   },
//   visibilityButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 6,
//     borderRadius: 6,
//     gap: 4,
//   },
//   publicButton: {
//     backgroundColor: "#d1fae5",
//   },
//   hiddenButton: {
//     backgroundColor: "#f3f4f6",
//   },
//   visibilityButtonText: {
//     fontSize: 11,
//     fontWeight: "500",
//   },
//   publicText: {
//     color: "#059669",
//   },
//   hiddenButtonText: {
//     color: "#6b7280",
//   },
//   deleteButton: {
//     backgroundColor: "#fee2e2",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 4,
//   },
//   featuredButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#f3f4f6",
//     margin: 8,
//     marginTop: 0,
//     paddingVertical: 8,
//     borderRadius: 6,
//     gap: 6,
//   },
//   featuredButtonActive: {
//     backgroundColor: "#fef3c7",
//   },
//   featuredButtonText: {
//     fontSize: 11,
//     fontWeight: "500",
//     color: "#6b7280",
//   },
//   featuredButtonTextActive: {
//     color: "#f59e0b",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#374151",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: "#6b7280",
//     textAlign: "center",
//     marginBottom: 24,
//     paddingHorizontal: 32,
//   },
//   emptyUploadButton: {
//     backgroundColor: "#7c3aed",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },
//   emptyUploadText: {
//     color: "#fff",
//     marginLeft: 8,
//     fontWeight: "600",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     zIndex: 10,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     borderRadius: 20,
//     padding: 8,
//   },
//   modalImage: {
//     width: "100%",
//     height: "80%",
//   },
// });

// export default PortFolioGallery;
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";

const BASE_URL = 'https://api.aissignatureevent.com/api';

const PortFolioGallery = () => {
  const navigation = useNavigation();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [planType, setPlanType] = useState("free");
  const [currentUsage, setCurrentUsage] = useState({ portfolioCount: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  
  // Message state
  const [message, setMessage] = useState({ visible: false, text: "", type: "success" });
  const fadeAnim = useState(new Animated.Value(0))[0];

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
    requestStoragePermission();
    checkAuthAndFetch();
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: "Storage Permission",
          message: "App needs access to your storage to upload images",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });

        console.log("Storage permission:", granted);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      if (token) {
        console.log("✅ Token found, length:", token.length);
        return token;
      }
      console.log("❌ No auth token found");
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const checkAuthAndFetch = async () => {
    const token = await getAuthToken();
    if (!token) {
      showMessage("Please login to view your portfolio", "error");
      setTimeout(() => {
        navigation.replace("Login");
      }, 2000);
      setLoading(false);
      return;
    }
    fetchMedia();
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/vendor-profile/dashboard/me`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.success) {
        // Filter to only show IMAGES (exclude videos)
        const imagesOnly = (response.data.data.media || []).filter(
          (item) => item.type === "image"
        );
        setMedia(imagesOnly);
        setLimits(response.data.data.limits);
        setPlanType(response.data.data.planKey || "free");
        setCurrentUsage(response.data.data.currentUsage || { portfolioCount: 0 });
        
        console.log("Images loaded:", imagesOnly.length);
      } else {
        console.error("Response success false:", response.data);
        showMessage(response.data.message || "Failed to load media", "error");
      }
    } catch (error) {
      console.error("Fetch media error:", error);
      showMessage("Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  };

  const getRemainingUploads = () => {
    if (!limits) return 0;
    if (limits.portfolioLimit === -1) return Infinity;
    return Math.max(0, limits.portfolioLimit - currentUsage.portfolioCount);
  };

  const canUpload = () => {
    const remaining = getRemainingUploads();
    return remaining === Infinity || remaining > 0;
  };

  // Normalize image URI for Android
  const normalizeImageUriForAndroid = async (uri) => {
    if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
      return uri;
    }

    const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.jpg`;

    try {
      await RNFS.copyFile(uri, destPath);
      console.log("Copied to temp file:", destPath);
      return destPath;
    } catch (err) {
      console.warn("Copy failed, using original:", err);
      return uri;
    }
  };

  // Function to get file type/mime type
  const getFileType = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    };
    return mimeTypes[extension] || 'image/jpeg';
  };

  // Enhanced function to log image details
  const logImageDetails = async (file, fileInfo = null) => {
    console.log('\n========== 📸 IMAGE DETAILS ==========');
    console.log('📁 File Name:', file.fileName || file.name || 'Unknown');
    console.log('📏 File Size:', file.fileSize ? `${(file.fileSize / (1024 * 1024)).toFixed(2)} MB (${file.fileSize} bytes)` : 'Unknown');
    console.log('🎨 File Type/Extension:', file.type || file.fileName?.split('.').pop() || 'Unknown');
    console.log('🖼️ MIME Type:', file.type || getFileType(file.fileName));
    console.log('📍 File URI:', file.uri);
    
    if (file.width && file.height) {
      console.log('📐 Dimensions:', `${file.width} x ${file.height} pixels`);
    }
    
    if (fileInfo) {
      console.log('💾 Actual File Size (RNFS):', `${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB (${fileInfo.size} bytes)`);
    }
    
    console.log('==========================================\n');
  };

  // Upload single image using RNFS
  const uploadSingleImage = async (file, attempt = 1) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("No token found");
      }
      
      // Log detailed image information before upload
      await logImageDetails(file);
      
      // Get the actual file path correctly
      let filePath = file.uri;
      
      // Remove file:// prefix if present
      if (filePath.startsWith('file://')) {
        filePath = filePath.replace('file://', '');
      }
      
      // For Android content:// URIs, we need to copy to a temporary file
      if (Platform.OS === "android" && filePath.startsWith("content://")) {
        const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}_${file.fileName || 'image.jpg'}`;
        
        console.log(`📋 Copying content URI to temp file: ${destPath}`);
        
        try {
          await RNFS.copyFile(filePath, destPath);
          filePath = destPath;
          console.log(`✅ Successfully copied to: ${filePath}`);
        } catch (copyError) {
          console.error(`❌ Failed to copy file: ${copyError}`);
          throw new Error(`Failed to process image file: ${copyError.message}`);
        }
      }
      
      // Verify file exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        throw new Error(`File does not exist at path: ${filePath}`);
      }
      
      // Get file stats for detailed size information
      const fileInfo = await RNFS.stat(filePath);
      console.log(`📊 File Stats - Size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB, Path: ${filePath}`);
      
      // Log again with actual file info
      await logImageDetails(file, fileInfo);
      
      const fileName = file.fileName || file.name || `photo_${Date.now()}.jpg`;
      const mimeType = file.type || getFileType(fileName);
      
      console.log(`🚀 Starting upload for: ${fileName}`);
      console.log(`📤 Local file path: ${filePath}`);
      console.log(`📤 MIME Type being sent: ${mimeType}`);
      console.log(`📤 Upload URL: ${BASE_URL}/vendor-profile/media`);
      
      // Upload using RNFS - IMPORTANT: Use the correct API
      const uploadResult = await RNFS.uploadFiles({
        toUrl: `${BASE_URL}/vendor-profile/media`,
        files: [
          {
            name: 'file',
            filename: fileName,
            filepath: filePath,  // This must be a LOCAL file path, not a URL
            filetype: mimeType,
          },
        ],
        fields: {
          type: 'image',
        },
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        begin: (response) => {
          console.log('📡 Upload began with jobId:', response.jobId);
        },
        progress: (response) => {
          const progress = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
          const sentMB = (response.totalBytesSent / (1024 * 1024)).toFixed(2);
          const totalMB = (response.totalBytesExpectedToSend / (1024 * 1024)).toFixed(2);
          console.log(`📊 Upload progress: ${progress}% (${sentMB} MB / ${totalMB} MB)`);
        },
      }).promise;
      
      console.log('✅ Upload result status:', uploadResult.statusCode);
      console.log('📦 Upload result body:', uploadResult.body);
      
      // Clean up temp file if we created one
      if (filePath.includes(RNFS.TemporaryDirectoryPath)) {
        try {
          await RNFS.unlink(filePath);
          console.log('🧹 Temp file cleaned up:', filePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file:', cleanupError);
        }
      }
      
      let data;
      try {
        data = JSON.parse(uploadResult.body);
      } catch (e) {
        console.error('Failed to parse response:', e);
        data = { success: false, message: uploadResult.body };
      }
      
      if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
        if (data.success) {
          console.log(`🎉 Upload successful! File: ${fileName}, Size: ${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB, Type: ${mimeType}`);
          return { success: true, data };
        } else {
          throw new Error(data.message || 'Upload failed: Server returned success=false');
        }
      } else {
        throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);
      }
      
    } catch (err) {
      console.log(`❌ Upload failed (attempt ${attempt}):`, err.message);
      console.log(`❌ Error details:`, err);
      
      if (attempt < 3) {
        console.log(`🔄 Retrying upload (${attempt + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return uploadSingleImage(file, attempt + 1);
      }
      
      return { success: false, reason: err.message };
    }
  };

  const pickImage = () => {
    if (!canUpload()) {
      showMessage("Portfolio limit reached. Upgrade your plan for more storage.", "error");
      return;
    }

    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 5, // Allow multiple images
        quality: 0.8,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("📱 User cancelled image selection");
          return;
        }

        if (response.errorCode) {
          console.error("❌ Image picker error:", response.errorMessage);
          showMessage(response.errorMessage, "error");
          return;
        }

        if (response.assets && response.assets.length > 0) {
          console.log(`\n🖼️ Selected ${response.assets.length} image(s) for upload\n`);
          
          // Log each selected image details
          response.assets.forEach((asset, index) => {
            console.log(`📸 Image ${index + 1} Details:`);
            console.log(`   Name: ${asset.fileName || 'Unknown'}`);
            console.log(`   Size: ${asset.fileSize ? (asset.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown'}`);
            console.log(`   Type: ${asset.type || asset.fileName?.split('.').pop() || 'Unknown'}`);
            console.log(`   Dimensions: ${asset.width || 'Unknown'} x ${asset.height || 'Unknown'}`);
            console.log(`   URI: ${asset.uri}\n`);
          });
          
          // Filter only images and check file size
          const validFiles = [];
          const errors = [];

          for (const asset of response.assets) {
            // Check file size (10 MB limit)
            if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
              console.log(`⚠️ File too large: ${asset.fileName || "Image"} - ${(asset.fileSize / (1024 * 1024)).toFixed(2)} MB exceeds 10 MB limit`);
              errors.push(`${asset.fileName || "Image"}: Exceeds 10 MB limit`);
              continue;
            }
            console.log(`✅ File valid: ${asset.fileName || "Image"} - ${asset.fileSize ? (asset.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Size unknown'}`);
            validFiles.push(asset);
          }

          // Cap at remaining quota
          const remaining = getRemainingUploads();
          const toUpload = remaining === Infinity ? validFiles : validFiles.slice(0, remaining);
          const skippedByLimit = validFiles.length - toUpload.length;

          if (skippedByLimit > 0) {
            console.log(`⚠️ Skipped ${skippedByLimit} file(s) due to plan limit (Remaining: ${remaining === Infinity ? 'Unlimited' : remaining})`);
          }

          if (toUpload.length === 0) {
            if (errors.length > 0) {
              showMessage(errors.join("\n"), "error");
            } else {
              showMessage("Portfolio limit reached. Upgrade your plan for more storage.", "error");
            }
            return;
          }

          console.log(`\n📤 Preparing to upload ${toUpload.length} file(s) out of ${validFiles.length} valid file(s)\n`);
          await uploadImages(toUpload, skippedByLimit, errors);
        }
      }
    );
  };

  const uploadImages = async (filesToUpload, skippedByLimit, errors) => {
    if (!filesToUpload.length) return;
    
    setUploading(true);
    let successCount = 0;
    const failedFiles = [...errors];
    
    console.log(`\n🚀 ========== STARTING BATCH UPLOAD ==========`);
    console.log(`📊 Total files to upload: ${filesToUpload.length}`);
    console.log(`🎯 Remaining quota: ${getRemainingUploads() === Infinity ? 'Unlimited' : getRemainingUploads()}\n`);
    
    // Upload one by one
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileSizeMB = file.fileSize ? (file.fileSize / (1024 * 1024)).toFixed(2) : 'Unknown';
      const fileType = file.type || file.fileName?.split('.').pop() || 'Unknown';
      
      console.log(`\n📤 ===== UPLOADING FILE ${i + 1}/${filesToUpload.length} =====`);
      console.log(`📁 File: ${file.fileName || 'Unknown'}`);
      console.log(`📏 Size: ${fileSizeMB} MB`);
      console.log(`🎨 Type: ${fileType}`);
      console.log(`📐 Dimensions: ${file.width || 'Unknown'} x ${file.height || 'Unknown'}`);
      
      setUploadProgress(`${i + 1} / ${filesToUpload.length}`);
      
      const result = await uploadSingleImage(file);
      
      if (result.success) {
        successCount++;
        console.log(`✅ SUCCESS! (${successCount}/${filesToUpload.length}) - File: ${file.fileName}`);
      } else {
        failedFiles.push(`${file.fileName || "Image"}: ${result.reason}`);
        console.log(`❌ FAILED! - File: ${file.fileName || 'Unknown'}, Reason: ${result.reason}`);
      }
      
      // Add delay between uploads
      if (i < filesToUpload.length - 1) {
        console.log(`⏳ Waiting 1.5 seconds before next upload...\n`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.log(`\n📊 ========== UPLOAD SUMMARY ==========`);
    console.log(`✅ Successful uploads: ${successCount}`);
    console.log(`❌ Failed uploads: ${failedFiles.length}`);
    console.log(`⚠️ Skipped due to limit: ${skippedByLimit}`);
    console.log(`📁 Total files processed: ${filesToUpload.length + skippedByLimit}`);
    console.log(`=====================================\n`);
    
    // Refresh media after uploads
    await fetchMedia();
    
    // Show result message
    if (successCount > 0) {
      showMessage(`✅ ${successCount} file${successCount > 1 ? "s" : ""} uploaded — pending admin approval.`, "success");
    }
    if (failedFiles.length > 0) {
      showMessage(`❌ ${failedFiles.length} file(s) failed to upload`, "error");
    }
    if (skippedByLimit > 0) {
      showMessage(`⚠️ ${skippedByLimit} file(s) skipped due to plan limit`, "error");
    }
    
    setUploading(false);
    setUploadProgress("");
  };

  // State for delete confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  const handleDelete = async (mediaId) => {
    setMediaToDelete(mediaId);
    setConfirmModalVisible(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!mediaToDelete) return;
    
    try {
      const token = await getAuthToken();
      await axios({
        method: 'DELETE',
        url: `${BASE_URL}/vendor-profile/media/${mediaToDelete}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      await fetchMedia();
      showMessage("Media deleted successfully", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("Failed to delete media", "error");
    } finally {
      setConfirmModalVisible(false);
      setMediaToDelete(null);
    }
  };

  const handleToggleVisibility = async (mediaId) => {
    try {
      const token = await getAuthToken();
      const response = await axios({
        method: 'PATCH',
        url: `${BASE_URL}/vendor-profile/media/${mediaId}/toggle-visibility`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setMedia(media.map((m) => (m._id === mediaId ? response.data.data : m)));
        showMessage(`Visibility updated to ${response.data.data.visibility}`, "success");
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      showMessage("Failed to update visibility", "error");
    }
  };

  const handleToggleFeatured = async (mediaId) => {
    try {
      const token = await getAuthToken();
      const response = await axios({
        method: 'PATCH',
        url: `${BASE_URL}/vendor-profile/media/${mediaId}/feature`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setMedia(media.map((m) => (m._id === mediaId ? response.data.data : m)));
        showMessage(response.data.data.isFeatured ? "Marked as featured" : "Removed from featured", "success");
      }
    } catch (error) {
      console.error("Toggle featured error:", error);
      showMessage("Failed to update featured status", "error");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return null;
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case "approved":
          return styles.statusApproved;
        case "rejected":
          return styles.statusRejected;
        default:
          return styles.statusPending;
      }
    };

    const getStatusText = () => {
      switch (status) {
        case "approved":
          return "✓ Approved";
        case "rejected":
          return "✗ Rejected";
        default:
          return "⏳ Pending";
      }
    };

    return (
      <View style={[styles.statusBadge, getStatusStyle()]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const displayCaption = `Portfolio Image ${index + 1}`;
    const fileSize = formatFileSize(item.metadata?.size);

    return (
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item);
            setModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: item.url }} style={styles.galleryImage} />
        </TouchableOpacity>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <StatusBadge status={item.approvalStatus} />
        </View>

        {/* Featured Badge */}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={12} color="#fff" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        {/* Hidden Badge */}
        {item.visibility === "hidden" && (
          <View style={styles.hiddenBadge}>
            <Icon name="eye-off" size={12} color="#fff" />
            <Text style={styles.hiddenText}>Hidden</Text>
          </View>
        )}

        <View style={styles.imageInfo}>
          <Text style={styles.imageCaption} numberOfLines={1}>
            {displayCaption}
          </Text>
          {fileSize && <Text style={styles.imageSize}>{fileSize}</Text>}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedImage(item);
              setModalVisible(true);
            }}
          >
            <Icon name="eye-outline" size={16} color="#4f46e5" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.visibilityButton,
              item.visibility === "public"
                ? styles.publicButton
                : styles.hiddenButton,
            ]}
            onPress={() => handleToggleVisibility(item._id)}
          >
            <Icon
              name={item.visibility === "public" ? "eye-outline" : "eye-off-outline"}
              size={16}
              color={item.visibility === "public" ? "#059669" : "#6b7280"}
            />
            <Text
              style={[
                styles.visibilityButtonText,
                item.visibility === "public"
                  ? styles.publicText
                  : styles.hiddenButtonText,
              ]}
            >
              {item.visibility === "public" ? "Public" : "Hidden"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
          >
            <Icon name="trash-outline" size={16} color="#dc2626" />
            <Text style={[styles.viewButtonText,{color : '#dc2626'}]}>Delete</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.featuredButton,
            item.isFeatured && styles.featuredButtonActive,
          ]}
          onPress={() => handleToggleFeatured(item._id)}
        >
          <Icon
            name={item.isFeatured ? "star" : "star-outline"}
            size={16}
            color={item.isFeatured ? "#f59e0b" : "#6b7280"}
          />
          <Text
            style={[
              styles.featuredButtonText,
              item.isFeatured && styles.featuredButtonTextActive,
            ]}
          >
            {item.isFeatured ? "Featured" : "Mark as Featured"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const uploadLabel = uploading
    ? `Uploading ${uploadProgress}…`
    : !canUpload()
    ? "Limit Reached"
    : "Upload Photos";

  return (
    <View style={styles.container}>
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

      {/* Plan Card */}
      {limits && (
        <View
          style={[
            styles.planCard,
            limits.portfolioLimit === -1
              ? styles.unlimitedPlanCard
              : getRemainingUploads() === 0
              ? styles.limitReachedPlanCard
              : getRemainingUploads() <= 2
              ? styles.lowLimitPlanCard
              : styles.normalPlanCard,
          ]}
        >
          <View style={styles.planInfo}>
            <Text style={styles.planText}>
              {limits.planName} {limits.planPrice && `(${limits.planPrice})`}
            </Text>
            <Text style={styles.usageText}>
              {limits.portfolioLimit === -1 ? (
                <Text>
                  <Icon name="infinite" size={14} color="#7c3aed" /> Unlimited
                  portfolio uploads
                </Text>
              ) : (
                <Text>
                  <Text style={styles.boldText}>{currentUsage.portfolioCount}</Text> of{" "}
                  <Text style={styles.boldText}>{limits.portfolioLimit}</Text> media used
                  {getRemainingUploads() > 0 && (
                    <Text style={styles.remainingText}>
                      {" "}({getRemainingUploads()} remaining)
                    </Text>
                  )}
                </Text>
              )}
            </Text>
            <Text style={styles.infoText}>
              📷 Photos only (images: JPG, PNG, etc.) · Videos go in "Video Content" section · All uploads require admin approval
            </Text>
          </View>

          {getRemainingUploads() === 0 && (
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Gallery Card */}
      <View style={styles.galleryCard}>
        <View style={styles.galleryHeader}>
          <View>
            <Text style={styles.galleryTitle}>Portfolio Photos</Text>
            <Text style={styles.galleryCount}>
              {media.length} photo{media.length !== 1 ? "s" : ""} · Images only
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!canUpload() || uploading) && styles.uploadButtonDisabled,
            ]}
            onPress={pickImage}
            disabled={!canUpload() || uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="cloud-upload-outline" size={18} color="#fff" />
            )}
            <Text style={styles.uploadText}>{uploadLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Tip Box */}
        <View style={styles.tipContainer}>
          <Icon name="information-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.tipText}>
            Tip: You can select multiple files at once. New uploads are pending admin approval before appearing publicly.
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading media…</Text>
          </View>
        ) : media.length > 0 ? (
          <FlatList
            data={media}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="images-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No photos uploaded yet</Text>
            <Text style={styles.emptyText}>
              Upload photos to build your portfolio. You can select multiple files at once.
            </Text>
            <TouchableOpacity style={styles.emptyUploadButton} onPress={pickImage}>
              <Icon name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.emptyUploadText}>Upload Your First Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Confirm Delete Modal */}
      <Modal visible={confirmModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalIcon}>
              <Icon name="trash-outline" size={48} color="#EF4444" />
            </View>
            <Text style={styles.confirmModalTitle}>Delete Media</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to delete this media? This action cannot be undone.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity style={styles.confirmModalCancelButton} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmModalDeleteButton]} onPress={handleDeleteConfirmed}>
                <Text style={styles.confirmModalDeleteText}>Delete</Text>
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
    backgroundColor: "#FFFF",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  confirmModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  confirmModalCancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  confirmModalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  confirmModalDeleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  planCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unlimitedPlanCard: {
    backgroundColor: "#f5f3ff",
    borderWidth: 2,
    borderColor: "#c4b5fd",
  },
  limitReachedPlanCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 2,
    borderColor: "#fecaca",
  },
  lowLimitPlanCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 2,
    borderColor: "#fed7aa",
  },
  normalPlanCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#bfdbfe",
  },
  planInfo: {
    flex: 1,
  },
  planText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  usageText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  boldText: {
    fontWeight: "700",
    color: "#374151",
  },
  remainingText: {
    color: "#059669",
  },
  infoText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  galleryCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    flex: 1,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  galleryCount: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  uploadButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  uploadText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 13,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tipText: {
    marginLeft: 8,
    color: "#2563EB",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  gridContainer: {
    paddingBottom: 20,
  },
  imageWrapper: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  galleryImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f3f4f6",
  },
  statusContainer: {
    position: "absolute",
    top: 8,
    left: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: "#10b981",
  },
  statusRejected: {
    backgroundColor: "#ef4444",
  },
  statusPending: {
    backgroundColor: "#f59e0b",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  hiddenBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hiddenText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  imageInfo: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  imageCaption: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  imageSize: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "column",
    padding: 8,
    gap: 6,
  },
  viewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#4f46e5",
  },
  visibilityButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  publicButton: {
    backgroundColor: "#d1fae5",
  },
  hiddenButton: {
    backgroundColor: "#f3f4f6",
  },
  visibilityButtonText: {
    fontSize: 11,
    fontWeight: "500",
  },
  publicText: {
    color: "#059669",
  },
  hiddenButtonText: {
    color: "#6b7280",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    margin: 8,
    marginTop: 0,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  featuredButtonActive: {
    backgroundColor: "#fef3c7",
  },
  featuredButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },
  featuredButtonTextActive: {
    color: "#f59e0b",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyUploadButton: {
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyUploadText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
});

export default PortFolioGallery;