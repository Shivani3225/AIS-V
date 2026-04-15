
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Image,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   FlatList,
//   Platform,
//   PermissionsAndroid,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNavigation } from "@react-navigation/native";
// import { launchImageLibrary } from "react-native-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import RNFS from "react-native-fs";

// const BASE_URL = 'https://api.aissignatureevent.com/api';

// const BlogPost = () => {
//   const navigation = useNavigation();
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [uploadingCover, setUploadingCover] = useState(false);
//   const [editingBlog, setEditingBlog] = useState(null);
//   const [showEditor, setShowEditor] = useState(false);
//   const [previewBlog, setPreviewBlog] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [formData, setFormData] = useState({
//     title: "",
//     excerpt: "",
//     content: "",
//     tags: "",
//     coverImage: null,
//     status: "draft",
//   });

//   // Request storage permission for Android
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
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } catch (err) {
//         console.error("Storage permission error:", err);
//         return false;
//       }
//     }
//     return true;
//   };

//   // Helper function to get auth token
//   const getAuthToken = async () => {
//     try {
//       const token = await AsyncStorage.getItem("vendorToken");
//       console.log("Token retrieved:", token ? "Yes" : "No");
//       return token;
//     } catch (error) {
//       console.error("Error getting token:", error);
//       return null;
//     }
//   };

//   // Normalize image URI for Android
//   const normalizeImageUriForAndroid = async (uri) => {
//     console.log("📁 Normalizing URI:", uri);
//     if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
//       console.log("📁 No normalization needed");
//       return uri;
//     }

//     const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.jpg`;
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

//   // API request helper using fetch
//   const apiRequest = async (method, endpoint, data = null) => {
//     try {
//       const token = await getAuthToken();

//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const headers = {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       };

//       const config = {
//         method,
//         headers,
//       };

//       if (data) {
//         config.body = JSON.stringify(data);
//       }

//       console.log(`Making ${method} request to: ${BASE_URL}${endpoint}`);
      
//       const response = await fetch(`${BASE_URL}${endpoint}`, config);
//       console.log("Response status:", response.status);
      
//       const responseData = await response.json();
      
//       if (response.status === 401) {
//         Alert.alert(
//           "Session Expired",
//           "Please login again",
//           [
//             {
//               text: "Login",
//               onPress: () => navigation.replace("Login"),
//             },
//           ]
//         );
//         throw new Error("Session expired");
//       }

//       if (!response.ok) {
//         throw new Error(responseData.message || `Request failed with status ${response.status}`);
//       }
      
//       return responseData;
//     } catch (error) {
//       console.error("API Error Details:");
//       console.error("Error message:", error.message);
//       throw error;
//     }
//   };

//   // Upload blog image using RNFS
//   const uploadBlogImage = async (file) => {
//     try {
//       const token = await getAuthToken();
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       // Normalize URI for Android
//       const normalizedUri = await normalizeImageUriForAndroid(file.uri);
//       const filePath = normalizedUri.replace('file://', '');
      
//       // Check if file exists
//       const exists = await RNFS.exists(filePath);
//       if (!exists) {
//         throw new Error('File does not exist at path: ' + filePath);
//       }

//       console.log("Uploading file from path:", filePath);

//       // Upload file using RNFS
//       const uploadResult = await RNFS.uploadFiles({
//         toUrl: `${BASE_URL}/vendor-profile/upload-image`,
//         files: [
//           {
//             name: 'file',
//             filename: file.fileName || 'blog-cover.jpg',
//             filepath: filePath,
//             filetype: file.type || 'image/jpeg',
//           },
//         ],
//         fields: {
//           folder: 'blogs',
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

//       if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
//         if (data.success) {
//           console.log("✅ Upload successful!");
//           return {
//             url: data.data.url,
//             publicId: data.data.publicId
//           };
//         }
//       }

//       throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);

//     } catch (error) {
//       console.error("Upload error:", error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     fetchBlogs();
//     requestStoragePermission();
//   }, []);

//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);
//       const response = await apiRequest("get", "/vendor-profile/dashboard/me");

//       if (response.success) {
//         setBlogs(response.data.blogs || []);
//         console.log("Blogs loaded:", response.data.blogs?.length || 0);
//       } else {
//         console.log("Response success false");
//       }
//     } catch (error) {
//       console.error("Fetch blogs error:", error);
//       Alert.alert("Error", "Failed to load blogs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = () => {
//     setEditingBlog(null);
//     setFormData({
//       title: "",
//       excerpt: "",
//       content: "",
//       tags: "",
//       coverImage: null,
//       status: "draft",
//     });
//     setFormErrors({});
//     setShowEditor(true);
//   };

//   const handleEdit = (blog) => {
//     setEditingBlog(blog);
//     setFormData({
//       title: blog.title,
//       excerpt: blog.excerpt || "",
//       content: blog.content,
//       tags: blog.tags?.join(", ") || "",
//       coverImage: blog.coverImage?.url ? { url: blog.coverImage.url, publicId: blog.coverImage.publicId || "" } : null,
//       status: blog.status,
//     });
//     setFormErrors({});
//     setShowEditor(true);
//   };

//   const getWordCount = (text = "") => {
//     return text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
//   };

//   const validateForm = (statusToSave) => {
//     const errors = {};

//     if (!formData.title.trim()) errors.title = "Title is required";
//     if (!formData.excerpt.trim()) errors.excerpt = "Excerpt is required";
//     if (!formData.content.trim()) errors.content = "Content is required";
//     if (!formData.coverImage?.url) errors.coverImage = "Cover image is required";

//     if (formData.title.trim() && formData.title.trim().length < 8) {
//       errors.title = "Title should be at least 8 characters";
//     }
//     if (formData.excerpt.trim() && formData.excerpt.trim().length < 20) {
//       errors.excerpt = "Excerpt should be at least 20 characters";
//     }
//     if (formData.content.trim() && getWordCount(formData.content) < 30) {
//       errors.content = "Content should be at least 30 words";
//     }

//     if (statusToSave === "published" && Object.keys(errors).length > 0) {
//       errors.submit = "Please complete all required fields before publishing.";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSave = async (statusToSave) => {
//     if (!validateForm(statusToSave)) return;

//     try {
//       setSaving(true);
      
//       const blogData = {
//         title: formData.title.trim(),
//         excerpt: formData.excerpt.trim(),
//         content: formData.content.trim(),
//         coverImage: formData.coverImage,
//         tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
//         status: statusToSave,
//       };

//       let response;
//       if (editingBlog) {
//         response = await apiRequest("put", `/vendor-profile/blogs/${editingBlog._id}`, blogData);
//       } else {
//         response = await apiRequest("post", "/vendor-profile/blogs", blogData);
//       }

//       if (response.success) {
//         Alert.alert("Success", editingBlog ? "Blog updated successfully!" : "Blog created successfully!");
//         fetchBlogs();
//         setShowEditor(false);
//       }
//     } catch (error) {
//       console.error("Save blog error:", error);
//       Alert.alert("Error", error.message || "Failed to save blog");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCoverUpload = async () => {
//     // Request permission first
//     const hasPermission = await requestStoragePermission();
//     if (!hasPermission) {
//       Alert.alert("Permission Denied", "Please grant storage permission to upload images");
//       return;
//     }

//     launchImageLibrary(
//       {
//         mediaType: "photo",
//         quality: 0.8,
//         maxWidth: 2000,
//         maxHeight: 2000,
//         includeBase64: false,
//       },
//       async (response) => {
//         if (response.didCancel) return;

//         if (response.error) {
//           Alert.alert("Error", "Failed to pick image");
//           return;
//         }

//         if (response.assets && response.assets.length > 0) {
//           const asset = response.assets[0];

//           if (!asset.type?.startsWith("image/")) {
//             Alert.alert("Error", "Please select an image file for cover image");
//             return;
//           }

//           if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
//             Alert.alert("Error", "Cover image must be less than 10 MB");
//             return;
//           }

//           try {
//             setUploadingCover(true);
            
//             // Upload the image using RNFS
//             const result = await uploadBlogImage(asset);
            
//             setFormData((prev) => ({
//               ...prev,
//               coverImage: { 
//                 url: result.url, 
//                 publicId: result.publicId 
//               },
//             }));
            
//             setFormErrors((prev) => ({ ...prev, coverImage: undefined }));
//             Alert.alert("Success", "Cover image uploaded successfully!");
//           } catch (error) {
//             console.error("Cover upload error:", error);
//             Alert.alert("Error", error.message || "Failed to upload cover image");
//           } finally {
//             setUploadingCover(false);
//           }
//         }
//       }
//     );
//   };

//   const handleDelete = async (blogId) => {
//     Alert.alert(
//       "Delete Blog",
//       "Are you sure you want to delete this blog?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await apiRequest("delete", `/vendor-profile/blogs/${blogId}`);
//               setBlogs(blogs.filter((b) => b._id !== blogId));
//               Alert.alert("Success", "Blog deleted successfully");
//             } catch (error) {
//               console.error("Delete blog error:", error);
//               Alert.alert("Error", "Failed to delete blog");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handlePublish = async (blogId) => {
//     try {
//       const response = await apiRequest("patch", `/vendor-profile/blogs/${blogId}/publish`);

//       if (response.success) {
//         Alert.alert("Success", "Blog published successfully!");
//         fetchBlogs();
//       }
//     } catch (error) {
//       console.error("Publish blog error:", error);
//       Alert.alert("Error", "Failed to publish blog");
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "published":
//         return styles.statusPublished;
//       case "draft":
//         return styles.statusDraft;
//       default:
//         return styles.statusDefault;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case "published":
//         return "PUBLISHED";
//       case "draft":
//         return "DRAFT";
//       default:
//         return status.toUpperCase();
//     }
//   };

//   const renderBlogItem = ({ item }) => {
//     const readTime = item.metadata?.readTime || Math.ceil(item.content.trim().split(/\s+/).length / 200);

//     return (
//       <View style={styles.blogCard}>
//         <View style={styles.coverImageContainer}>
//           {item.coverImage?.url ? (
//             <Image source={{ uri: item.coverImage.url }} style={styles.coverImage} />
//           ) : (
//             <View style={styles.coverPlaceholder}>
//               <Icon name="image-outline" size={32} color="#9CA3AF" />
//             </View>
//           )}
//           <TouchableOpacity
//             style={styles.previewButton}
//             onPress={() => setPreviewBlog(item)}
//           >
//             <Text style={styles.previewButtonText}>Preview</Text>
//           </TouchableOpacity>
//           <View style={[styles.statusBadge, getStatusColor(item.status)]}>
//             <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
//           </View>
//         </View>

//         <View style={styles.blogContent}>
//           <Text style={styles.blogTitle} numberOfLines={2}>
//             {item.title}
//           </Text>
//           <Text style={styles.blogExcerpt} numberOfLines={2}>
//             {item.excerpt}
//           </Text>

//           <View style={styles.metaRow}>
//             <Icon name="time-outline" size={14} color="#6B7280" />
//             <Text style={styles.metaText}> {readTime} min read</Text>
//             <Text style={styles.metaText}>•</Text>
//             <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
//           </View>

//           {item.tags?.length > 0 && (
//             <View style={styles.tagContainer}>
//               {item.tags.slice(0, 3).map((tag, idx) => (
//                 <View key={idx} style={styles.tag}>
//                   <Text style={styles.tagText}>#{tag}</Text>
//                 </View>
//               ))}
//             </View>
//           )}

//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={[styles.actionBtn, styles.viewBtn]}
//               onPress={() => setPreviewBlog(item)}
//             >
//               <Icon name="eye-outline" size={16} color="#4F46E5" />
//               <Text style={styles.viewBtnText}>Preview</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionBtn, styles.editBtn]}
//               onPress={() => handleEdit(item)}
//             >
//               <Icon name="create-outline" size={16} color="#6B7280" />
//               <Text style={styles.editBtnText}>Edit</Text>
//             </TouchableOpacity>

//             {item.status === "draft" && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.publishBtn]}
//                 onPress={() => handlePublish(item._id)}
//               >
//                 <Icon name="send-outline" size={16} color="#059669" />
//                 <Text style={styles.publishBtnText}>Publish</Text>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={[styles.actionBtn, styles.deleteBtn]}
//               onPress={() => handleDelete(item._id)}
//             >
//               <Icon name="trash-outline" size={16} color="#DC2626" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Main Content */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.content}
//       >
//         <View style={styles.headerRow}>
//           <View style={{width : '60%'}}>
//             <Text style={styles.heading}>Blog Posts</Text>
//             <Text style={styles.subHeading}>Share your expertise and stories</Text>
//           </View>

//           <TouchableOpacity style={styles.newBtn} onPress={handleCreate}>
//             <Icon name="add" size={18} color="#fff" />
//             <Text style={styles.newBtnText}>New Blog Post</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Loading State */}
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#7C3AED" />
//             <Text style={styles.loadingText}>Loading blogs...</Text>
//           </View>
//         ) : blogs.length > 0 ? (
//           <FlatList
//             data={blogs}
//             renderItem={renderBlogItem}
//             keyExtractor={(item) => item._id}
//             scrollEnabled={false}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Icon name="document-text-outline" size={64} color="#D1D5DB" />
//             <Text style={styles.emptyTitle}>No blog posts yet</Text>
//             <Text style={styles.emptyText}>
//               Share your expertise and connect with customers
//             </Text>
//             <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
//               <Icon name="add" size={20} color="#fff" />
//               <Text style={styles.emptyButtonText}>Create Your First Post</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Blog Editor Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showEditor}
//         onRequestClose={() => setShowEditor(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
//               </Text>
//               <TouchableOpacity onPress={() => setShowEditor(false)}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.modalBody}>
//                 {/* Title */}
//                 <Text style={styles.label}>
//                   Blog Title <Text style={styles.required}>*</Text>
//                 </Text>
//                 <TextInput
//                   style={[styles.input, formErrors.title && styles.inputError]}
//                   placeholder="Enter an engaging title..."
//                   placeholderTextColor="#9CA3AF"
//                   value={formData.title}
//                   onChangeText={(text) => setFormData({ ...formData, title: text })}
//                 />
//                 {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}

//                 {/* Excerpt */}
//                 <Text style={styles.label}>
//                   Excerpt <Text style={styles.required}>*</Text>
//                 </Text>
//                 <TextInput
//                   style={[styles.input, styles.textArea, formErrors.excerpt && styles.inputError]}
//                   placeholder="Write a short summary of your blog..."
//                   placeholderTextColor="#9CA3AF"
//                   multiline
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                   value={formData.excerpt}
//                   onChangeText={(text) => setFormData({ ...formData, excerpt: text })}
//                 />
//                 {formErrors.excerpt && <Text style={styles.errorText}>{formErrors.excerpt}</Text>}

//                 {/* Cover Image */}
//                 <Text style={styles.label}>
//                   Cover Image <Text style={styles.required}>*</Text>
//                 </Text>
//                 <View style={styles.coverUploadContainer}>
//                   {formData.coverImage?.url ? (
//                     <View style={styles.coverPreviewContainer}>
//                       <Image source={{ uri: formData.coverImage.url }} style={styles.coverPreview} />
//                       <TouchableOpacity
//                         style={styles.removeCoverBtn}
//                         onPress={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
//                       >
//                         <Text style={styles.removeCoverText}>Remove Cover</Text>
//                       </TouchableOpacity>
//                     </View>
//                   ) : (
//                     <TouchableOpacity style={styles.uploadBtn} onPress={handleCoverUpload} disabled={uploadingCover}>
//                       {uploadingCover ? (
//                         <ActivityIndicator size="small" color="#7C3AED" />
//                       ) : (
//                         <>
//                           <Icon name="cloud-upload-outline" size={20} color="#7C3AED" />
//                           <Text style={styles.uploadBtnText}>Upload Cover Image</Text>
//                         </>
//                       )}
//                     </TouchableOpacity>
//                   )}
//                 </View>
//                 {formErrors.coverImage && <Text style={styles.errorText}>{formErrors.coverImage}</Text>}

//                 {/* Content */}
//                 <Text style={styles.label}>
//                   Content <Text style={styles.required}>*</Text>
//                 </Text>
//                 <TextInput
//                   style={[styles.input, styles.contentArea, formErrors.content && styles.inputError]}
//                   placeholder="Write your blog content here..."
//                   placeholderTextColor="#9CA3AF"
//                   multiline
//                   numberOfLines={12}
//                   textAlignVertical="top"
//                   value={formData.content}
//                   onChangeText={(text) => setFormData({ ...formData, content: text })}
//                 />
//                 <Text style={styles.wordCount}>{getWordCount(formData.content)} words</Text>
//                 {formErrors.content && <Text style={styles.errorText}>{formErrors.content}</Text>}

//                 {/* Tags */}
//                 <Text style={styles.label}>Tags (comma separated)</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="e.g., wedding, photography, tips"
//                   placeholderTextColor="#9CA3AF"
//                   value={formData.tags}
//                   onChangeText={(text) => setFormData({ ...formData, tags: text })}
//                 />

//                 {/* Form Buttons */}
//                 <View style={styles.formButtons}>
//                   <TouchableOpacity
//                     style={[styles.formBtn, styles.draftBtn]}
//                     onPress={() => handleSave("draft")}
//                     disabled={saving}
//                   >
//                     <Text style={styles.draftBtnText}>
//                       {saving ? "Saving..." : "Save as Draft"}
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.formBtn, styles.publishBtnModal]}
//                     onPress={() => handleSave("published")}
//                     disabled={saving}
//                   >
//                     <Icon name="send-outline" size={18} color="#fff" />
//                     <Text style={styles.publishBtnTextModal}>Publish Now</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {formErrors.submit && (
//                   <View style={styles.errorContainer}>
//                     <Icon name="alert-circle-outline" size={16} color="#DC2626" />
//                     <Text style={styles.errorContainerText}>{formErrors.submit}</Text>
//                   </View>
//                 )}
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Preview Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={previewBlog !== null}
//         onRequestClose={() => setPreviewBlog(null)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.previewModalContent}>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               {previewBlog?.coverImage?.url && (
//                 <Image source={{ uri: previewBlog.coverImage.url }} style={styles.previewCover} />
//               )}
//               <View style={styles.previewBody}>
//                 <View style={styles.previewHeader}>
//                   <View style={styles.previewTitleContainer}>
//                     <Text style={styles.previewTitle}>{previewBlog?.title}</Text>
//                     <Text style={styles.previewDate}>
//                       {previewBlog && new Date(previewBlog.createdAt).toLocaleDateString()}
//                     </Text>
//                   </View>
//                   <TouchableOpacity onPress={() => setPreviewBlog(null)}>
//                     <Icon name="close" size={24} color="#6B7280" />
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.previewExcerpt}>{previewBlog?.excerpt}</Text>
//                 <Text style={styles.previewContent}>{previewBlog?.content}</Text>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// // Styles remain the same as before...
// const styles = StyleSheet.create({
//   // ... (all your existing styles remain exactly the same)
//   container: {
//     flex: 1,
//     backgroundColor: "#ffff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//     elevation: 4,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#7C3AED",
//     marginLeft: 70,
//   },
//   content: {
//     padding: 16,
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   subHeading: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//   },
//   newBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#7C3AED",
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     gap: 6,
//   },
//   newBtnText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ffff',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   blogCard: {
//     backgroundColor: "#ffff",
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   coverImageContainer: {
//     position: "relative",
//     height: 180,
//     backgroundColor: "#F3F4F6",
//   },
//   coverImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   coverPlaceholder: {
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F3F4F6",
//   },
//   previewButton: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",
//     alignItems: "center",
//     opacity: 0,
//   },
//   statusBadge: {
//     position: "absolute",
//     top: 12,
//     left: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   statusPublished: {
//     backgroundColor: "#10B981",
//   },
//   statusDraft: {
//     backgroundColor: "#F59E0B",
//   },
//   statusDefault: {
//     backgroundColor: "#9CA3AF",
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   blogContent: {
//     padding: 16,
//   },
//   blogTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//     marginBottom: 8,
//   },
//   blogExcerpt: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginBottom: 12,
//     lineHeight: 20,
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//     gap: 6,
//   },
//   metaText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   tagContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//     gap: 6,
//   },
//   tag: {
//     backgroundColor: "#EEF2FF",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   tagText: {
//     fontSize: 10,
//     color: "#4F46E5",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 4,
//   },
//   viewBtn: {
//     backgroundColor: "#EEF2FF",
//   },
//   viewBtnText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#4F46E5",
//   },
//   editBtn: {
//     backgroundColor: "#F3F4F6",
//   },
//   editBtnText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#6B7280",
//   },
//   publishBtn: {
//     backgroundColor: "#D1FAE5",
//   },
//   publishBtnText: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: "#059669",
//   },
//   deleteBtn: {
//     backgroundColor: "#FEE2E2",
//     paddingHorizontal: 12,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 60,
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     borderStyle: "dashed",
//     borderRadius: 12,
//     marginTop: 20,
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
//     color: "#6B7280",
//     textAlign: "center",
//     marginBottom: 24,
//     paddingHorizontal: 32,
//   },
//   emptyButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#7C3AED",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     gap: 8,
//   },
//   emptyButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     width: "90%",
//     maxHeight: "90%",
//     overflow: "hidden",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   modalBody: {
//     padding: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 8,
//   },
//   required: {
//     color: "#EF4444",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//   },
//   inputError: {
//     borderColor: "#EF4444",
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: "top",
//   },
//   contentArea: {
//     minHeight: 200,
//     textAlignVertical: "top",
//   },
//   wordCount: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginTop: -12,
//     marginBottom: 16,
//     textAlign: "right",
//   },
//   errorText: {
//     fontSize: 12,
//     color: "#EF4444",
//     marginTop: -12,
//     marginBottom: 16,
//   },
//   coverUploadContainer: {
//     marginBottom: 16,
//   },
//   coverPreviewContainer: {
//     alignItems: "center",
//   },
//   coverPreview: {
//     width: "100%",
//     height: 160,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   removeCoverBtn: {
//     backgroundColor: "#FEE2E2",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   removeCoverText: {
//     color: "#DC2626",
//     fontSize: 12,
//     fontWeight: "500",
//   },
//   uploadBtn: {
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     borderStyle: "dashed",
//     borderRadius: 8,
//     padding: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   },
//   uploadBtnText: {
//     fontSize: 14,
//     color: "#7C3AED",
//     fontWeight: "500",
//   },
//   formButtons: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 8,
//   },
//   formBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   draftBtn: {
//     borderWidth: 1,
//     borderColor: "#7C3AED",
//     backgroundColor: "transparent",
//   },
//   draftBtnText: {
//     color: "#7C3AED",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   publishBtnModal: {
//     backgroundColor: "#7C3AED",
//     flexDirection: "row",
//     gap: 8,
//   },
//   publishBtnTextModal: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   errorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "#FEF2F2",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   errorContainerText: {
//     fontSize: 12,
//     color: "#DC2626",
//     flex: 1,
//   },
//   previewModalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     width: "90%",
//     maxHeight: "90%",
//     overflow: "hidden",
//   },
//   previewCover: {
//     width: "100%",
//     height: 200,
//     resizeMode: "cover",
//   },
//   previewBody: {
//     padding: 20,
//   },
//   previewHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   previewTitleContainer: {
//     flex: 1,
//     marginRight: 12,
//   },
//   previewTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#111827",
//     marginBottom: 8,
//   },
//   previewDate: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   previewExcerpt: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#374151",
//     marginBottom: 16,
//     lineHeight: 24,
//   },
//   previewContent: {
//     fontSize: 14,
//     color: "#6B7280",
//     lineHeight: 22,
//   },
// });

// export default BlogPost;
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  Platform,
  PermissionsAndroid,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";

const BASE_URL = 'https://api.aissignatureevent.com/api';

const BlogPost = () => {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    coverImage: null,
    status: "draft",
  });

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

  // Request storage permission for Android
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
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error("Storage permission error:", err);
        return false;
      }
    }
    return true;
  };

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      console.log("Token retrieved:", token ? "Yes" : "No");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Normalize image URI for Android
  const normalizeImageUriForAndroid = async (uri) => {
    console.log("📁 Normalizing URI:", uri);
    if (Platform.OS !== "android" || !uri || !uri.startsWith("content://")) {
      console.log("📁 No normalization needed");
      return uri;
    }

    const destPath = `${RNFS.TemporaryDirectoryPath}/upload_${Date.now()}.jpg`;
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

  // API request helper using fetch
  const apiRequest = async (method, endpoint, data = null) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      const config = {
        method,
        headers,
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      console.log(`Making ${method} request to: ${BASE_URL}${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      console.log("Response status:", response.status);
      
      const responseData = await response.json();
      
      if (response.status === 401) {
        showMessage("Session expired. Please login again", "error");
        setTimeout(() => {
          navigation.replace("Login");
        }, 2000);
        throw new Error("Session expired");
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }
      
      return responseData;
    } catch (error) {
      console.error("API Error Details:");
      console.error("Error message:", error.message);
      throw error;
    }
  };

  // Upload blog image using RNFS
  const uploadBlogImage = async (file) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Normalize URI for Android
      const normalizedUri = await normalizeImageUriForAndroid(file.uri);
      const filePath = normalizedUri.replace('file://', '');
      
      // Check if file exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        throw new Error('File does not exist at path: ' + filePath);
      }

      console.log("Uploading file from path:", filePath);

      // Upload file using RNFS
      const uploadResult = await RNFS.uploadFiles({
        toUrl: `${BASE_URL}/vendor-profile/upload-image`,
        files: [
          {
            name: 'file',
            filename: file.fileName || 'blog-cover.jpg',
            filepath: filePath,
            filetype: file.type || 'image/jpeg',
          },
        ],
        fields: {
          folder: 'blogs',
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

      if (uploadResult.statusCode === 200 || uploadResult.statusCode === 201) {
        if (data.success) {
          console.log("✅ Upload successful!");
          return {
            url: data.data.url,
            publicId: data.data.publicId
          };
        }
      }

      throw new Error(data.message || `Upload failed with status ${uploadResult.statusCode}`);

    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBlogs();
    requestStoragePermission();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("get", "/vendor-profile/dashboard/me");

      if (response.success) {
        setBlogs(response.data.blogs || []);
        console.log("Blogs loaded:", response.data.blogs?.length || 0);
      } else {
        console.log("Response success false");
      }
    } catch (error) {
      console.error("Fetch blogs error:", error);
      showMessage("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      coverImage: null,
      status: "draft",
    });
    setFormErrors({});
    setShowEditor(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      tags: blog.tags?.join(", ") || "",
      coverImage: blog.coverImage?.url ? { url: blog.coverImage.url, publicId: blog.coverImage.publicId || "" } : null,
      status: blog.status,
    });
    setFormErrors({});
    setShowEditor(true);
  };

  const getWordCount = (text = "") => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  };

  const validateForm = (statusToSave) => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.excerpt.trim()) errors.excerpt = "Excerpt is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (!formData.coverImage?.url) errors.coverImage = "Cover image is required";

    if (formData.title.trim() && formData.title.trim().length < 8) {
      errors.title = "Title should be at least 8 characters";
    }
    if (formData.excerpt.trim() && formData.excerpt.trim().length < 20) {
      errors.excerpt = "Excerpt should be at least 20 characters";
    }
    if (formData.content.trim() && getWordCount(formData.content) < 30) {
      errors.content = "Content should be at least 30 words";
    }

    if (statusToSave === "published" && Object.keys(errors).length > 0) {
      errors.submit = "Please complete all required fields before publishing.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (statusToSave) => {
    if (!validateForm(statusToSave)) return;

    try {
      setSaving(true);
      
      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        coverImage: formData.coverImage,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: statusToSave,
      };

      let response;
      if (editingBlog) {
        response = await apiRequest("put", `/vendor-profile/blogs/${editingBlog._id}`, blogData);
      } else {
        response = await apiRequest("post", "/vendor-profile/blogs", blogData);
      }

      if (response.success) {
        showMessage(editingBlog ? "Blog updated successfully!" : "Blog created successfully!", "success");
        fetchBlogs();
        setShowEditor(false);
      }
    } catch (error) {
      console.error("Save blog error:", error);
      showMessage(error.message || "Failed to save blog", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async () => {
    // Request permission first
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      showMessage("Please grant storage permission to upload images", "error");
      return;
    }

    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
        includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) return;

        if (response.error) {
          showMessage("Failed to pick image", "error");
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          if (!asset.type?.startsWith("image/")) {
            showMessage("Please select an image file for cover image", "error");
            return;
          }

          if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
            showMessage("Cover image must be less than 10 MB", "error");
            return;
          }

          try {
            setUploadingCover(true);
            
            // Upload the image using RNFS
            const result = await uploadBlogImage(asset);
            
            setFormData((prev) => ({
              ...prev,
              coverImage: { 
                url: result.url, 
                publicId: result.publicId 
              },
            }));
            
            setFormErrors((prev) => ({ ...prev, coverImage: undefined }));
            showMessage("Cover image uploaded successfully!", "success");
          } catch (error) {
            console.error("Cover upload error:", error);
            showMessage(error.message || "Failed to upload cover image", "error");
          } finally {
            setUploadingCover(false);
          }
        }
      }
    );
  };

  // State for delete confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const handleDelete = async (blogId) => {
    setBlogToDelete(blogId);
    setConfirmModalVisible(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!blogToDelete) return;
    
    try {
      await apiRequest("delete", `/vendor-profile/blogs/${blogToDelete}`);
      setBlogs(blogs.filter((b) => b._id !== blogToDelete));
      showMessage("Blog deleted successfully", "success");
    } catch (error) {
      console.error("Delete blog error:", error);
      showMessage("Failed to delete blog", "error");
    } finally {
      setConfirmModalVisible(false);
      setBlogToDelete(null);
    }
  };

  const handlePublish = async (blogId) => {
    try {
      const response = await apiRequest("patch", `/vendor-profile/blogs/${blogId}/publish`);

      if (response.success) {
        showMessage("Blog published successfully!", "success");
        fetchBlogs();
      }
    } catch (error) {
      console.error("Publish blog error:", error);
      showMessage("Failed to publish blog", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return styles.statusPublished;
      case "draft":
        return styles.statusDraft;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "PUBLISHED";
      case "draft":
        return "DRAFT";
      default:
        return status.toUpperCase();
    }
  };

  const renderBlogItem = ({ item }) => {
    const readTime = item.metadata?.readTime || Math.ceil(item.content.trim().split(/\s+/).length / 200);

    return (
      <View style={styles.blogCard}>
        <View style={styles.coverImageContainer}>
          {item.coverImage?.url ? (
            <Image source={{ uri: item.coverImage.url }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Icon name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => setPreviewBlog(item)}
          >
            <Text style={styles.previewButtonText}>Preview</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, getStatusColor(item.status)]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.blogContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.blogExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>

          <View style={styles.metaRow}>
            <Icon name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}> {readTime} min read</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          {item.tags?.length > 0 && (
            <View style={styles.tagContainer}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.viewBtn]}
              onPress={() => setPreviewBlog(item)}
            >
              <Icon name="eye-outline" size={16} color="#4F46E5" />
              <Text style={styles.viewBtnText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => handleEdit(item)}
            >
              <Icon name="create-outline" size={16} color="#6B7280" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            {item.status === "draft" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.publishBtn]}
                onPress={() => handlePublish(item._id)}
              >
                <Icon name="send-outline" size={16} color="#059669" />
                <Text style={styles.publishBtnText}>Publish</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDelete(item._id)}
            >
              <Icon name="trash-outline" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={{width : '60%'}}>
            <Text style={styles.heading}>Blog Posts</Text>
            <Text style={styles.subHeading}>Share your expertise and stories</Text>
          </View>

          <TouchableOpacity style={styles.newBtn} onPress={handleCreate}>
            <Icon name="add" size={18} color="#fff" />
            <Text style={styles.newBtnText}>New Blog Post</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading blogs...</Text>
          </View>
        ) : blogs.length > 0 ? (
          <FlatList
            data={blogs}
            renderItem={renderBlogItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No blog posts yet</Text>
            <Text style={styles.emptyText}>
              Share your expertise and connect with customers
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Blog Editor Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditor}
        onRequestClose={() => setShowEditor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </Text>
              <TouchableOpacity onPress={() => setShowEditor(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                {/* Title */}
                <Text style={styles.label}>
                  Blog Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, formErrors.title && styles.inputError]}
                  placeholder="Enter an engaging title..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}

                {/* Excerpt */}
                <Text style={styles.label}>
                  Excerpt <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, formErrors.excerpt && styles.inputError]}
                  placeholder="Write a short summary of your blog..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.excerpt}
                  onChangeText={(text) => setFormData({ ...formData, excerpt: text })}
                />
                {formErrors.excerpt && <Text style={styles.errorText}>{formErrors.excerpt}</Text>}

                {/* Cover Image */}
                <Text style={styles.label}>
                  Cover Image <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.coverUploadContainer}>
                  {formData.coverImage?.url ? (
                    <View style={styles.coverPreviewContainer}>
                      <Image source={{ uri: formData.coverImage.url }} style={styles.coverPreview} />
                      <TouchableOpacity
                        style={styles.removeCoverBtn}
                        onPress={() => setFormData((prev) => ({ ...prev, coverImage: null }))}
                      >
                        <Text style={styles.removeCoverText}>Remove Cover</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadBtn} onPress={handleCoverUpload} disabled={uploadingCover}>
                      {uploadingCover ? (
                        <ActivityIndicator size="small" color="#7C3AED" />
                      ) : (
                        <>
                          <Icon name="cloud-upload-outline" size={20} color="#7C3AED" />
                          <Text style={styles.uploadBtnText}>Upload Cover Image</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                {formErrors.coverImage && <Text style={styles.errorText}>{formErrors.coverImage}</Text>}

                {/* Content */}
                <Text style={styles.label}>
                  Content <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.contentArea, formErrors.content && styles.inputError]}
                  placeholder="Write your blog content here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={12}
                  textAlignVertical="top"
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                />
                <Text style={styles.wordCount}>{getWordCount(formData.content)} words</Text>
                {formErrors.content && <Text style={styles.errorText}>{formErrors.content}</Text>}

                {/* Tags */}
                <Text style={styles.label}>Tags (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., wedding, photography, tips"
                  placeholderTextColor="#9CA3AF"
                  value={formData.tags}
                  onChangeText={(text) => setFormData({ ...formData, tags: text })}
                />

                {/* Form Buttons */}
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formBtn, styles.draftBtn]}
                    onPress={() => handleSave("draft")}
                    disabled={saving}
                  >
                    <Text style={styles.draftBtnText}>
                      {saving ? "Saving..." : "Save as Draft"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.formBtn, styles.publishBtnModal]}
                    onPress={() => handleSave("published")}
                    disabled={saving}
                  >
                    <Icon name="send-outline" size={18} color="#fff" />
                    <Text style={styles.publishBtnTextModal}>Publish Now</Text>
                  </TouchableOpacity>
                </View>

                {formErrors.submit && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.errorContainerText}>{formErrors.submit}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={previewBlog !== null}
        onRequestClose={() => setPreviewBlog(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.previewModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {previewBlog?.coverImage?.url && (
                <Image source={{ uri: previewBlog.coverImage.url }} style={styles.previewCover} />
              )}
              <View style={styles.previewBody}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewTitleContainer}>
                    <Text style={styles.previewTitle}>{previewBlog?.title}</Text>
                    <Text style={styles.previewDate}>
                      {previewBlog && new Date(previewBlog.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setPreviewBlog(null)}>
                    <Icon name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.previewExcerpt}>{previewBlog?.excerpt}</Text>
                <Text style={styles.previewContent}>{previewBlog?.content}</Text>
              </View>
            </ScrollView>
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
            <Text style={styles.confirmModalTitle}>Delete Blog</Text>
            <Text style={styles.confirmModalMessage}>
              Are you sure you want to delete this blog? This action cannot be undone.
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
    backgroundColor: "#ffff",
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7C3AED",
    marginLeft: 70,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subHeading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  newBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  blogCard: {
    backgroundColor: "#ffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  coverImageContainer: {
    position: "relative",
    height: 180,
    backgroundColor: "#F3F4F6",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  previewButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPublished: {
    backgroundColor: "#10B981",
  },
  statusDraft: {
    backgroundColor: "#F59E0B",
  },
  statusDefault: {
    backgroundColor: "#9CA3AF",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: "#4F46E5",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewBtn: {
    backgroundColor: "#EEF2FF",
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4F46E5",
  },
  editBtn: {
    backgroundColor: "#F3F4F6",
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  publishBtn: {
    backgroundColor: "#D1FAE5",
  },
  publishBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    marginTop: 20,
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
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  contentArea: {
    minHeight: 200,
    textAlignVertical: "top",
  },
  wordCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -12,
    marginBottom: 16,
    textAlign: "right",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: -12,
    marginBottom: 16,
  },
  coverUploadContainer: {
    marginBottom: 16,
  },
  coverPreviewContainer: {
    alignItems: "center",
  },
  coverPreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeCoverBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeCoverText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
  },
  uploadBtn: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "500",
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  draftBtn: {
    borderWidth: 1,
    borderColor: "#7C3AED",
    backgroundColor: "transparent",
  },
  draftBtnText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
  },
  publishBtnModal: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    gap: 8,
  },
  publishBtnTextModal: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorContainerText: {
    fontSize: 12,
    color: "#DC2626",
    flex: 1,
  },
  previewModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "90%",
    overflow: "hidden",
  },
  previewCover: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  previewBody: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  previewTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  previewExcerpt: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 16,
    lineHeight: 24,
  },
  previewContent: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
});

export default BlogPost;