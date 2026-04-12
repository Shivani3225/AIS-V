import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'https://my-backend-dnj5.onrender.com/api';

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

  // Helper function to get auth token - using the correct key from login
  const getAuthToken = async () => {
    try {
      // Use the same token key as in login screen
      const token = await AsyncStorage.getItem("vendorToken");
      if (token) {
        console.log("✅ Token found, length:", token.length);
        return token;
      }
      
      console.log("❌ No auth token found (vendorToken key)");
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // API request helper with better error handling
 // API request helper - ISKO COMPLETELY REPLACE KAREIN
const apiRequest = async (method, endpoint, data = null, isFormData = false) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      console.error("No auth token found");
      throw new Error("Authentication required");
    }

    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 120000,
    };

    // IMPORTANT: For FormData, don't set Content-Type header
    if (isFormData) {
      config.headers = {
        "Authorization": `Bearer ${token}`,
        // NO Content-Type header - let axios/browser set it with boundary
      };
      config.data = data;
    } else {
      config.headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      if (data) {
        config.data = data;
      }
    }

    console.log(`Making ${method} request to: ${BASE_URL}${endpoint}`);
    const response = await axios(config);
    console.log("Response status:", response.status);
    
    return response.data;
  } catch (error) {
    console.error("API Error Details:");
    console.error("Error message:", error.message);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    // Log full error for debugging
    if (error.message === "Network Error") {
      console.error("FULL NETWORK ERROR:", JSON.stringify(error, null, 2));
    }
    
    if (error.response?.status === 401) {
      Alert.alert(
        "Session Expired", 
        "Please login again",
        [
          {
            text: "Login",
            onPress: () => navigation.replace("Login")
          }
        ]
      );
    }
    
    throw error;
  }
};


// Add this function to test API connectivity
const testAPIConnection = async () => {
  try {
    const token = await getAuthToken();
    console.log("Testing API connection...");
    console.log("Token exists:", !!token);
    console.log("API URL:", BASE_URL);
    
    // Test with a simple GET request
    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}/vendor-profile/dashboard/me`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log("API Connection: SUCCESS");
    console.log("Response status:", response.status);
    return true;
  } catch (err) {
    console.log("API Connection: FAILED");
    console.log("Error:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log("Server is not reachable. Check if server is running.");
    }
    return false;
  }
};

// Call this in useEffect for debugging
useEffect(() => {
  checkAuthAndFetch();
  testAPIConnection(); // Add this line
}, []);
  const checkAuthAndFetch = async () => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert(
        "Authentication Required",
        "Please login to view your portfolio",
        [
          {
            text: "Login",
            onPress: () => navigation.replace("Login")
          }
        ]
      );
      setLoading(false);
      return;
    }
    fetchMedia();
  };

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      console.log("Fetching media...");
      const response = await apiRequest("get", "/vendor-profile/dashboard/me");
      
      console.log("Response success:", response.success);
      
      if (response.success) {
        // Filter to only show IMAGES (exclude videos)
        const imagesOnly = (response.data.media || []).filter(
          (item) => item.type === "image"
        );
        setMedia(imagesOnly);
        setLimits(response.data.limits);
        setPlanType(response.data.planKey || "free");
        setCurrentUsage(response.data.currentUsage || { portfolioCount: 0 });
        
        console.log("Images loaded:", imagesOnly.length);
      } else {
        console.error("Response success false:", response);
        Alert.alert("Error", response.message || "Failed to load media");
      }
    } catch (error) {
      console.error("Fetch media error:", error);
      
      let errorMessage = "Failed to load media";
      if (error.response?.status === 401) {
        errorMessage = "Please login again";
      } else if (error.response?.status === 404) {
        errorMessage = "API endpoint not found";
      } else if (error.message === "Network Error") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message === "Authentication required") {
        errorMessage = "Please login to continue";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Error", errorMessage);
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

  const getErrorMessage = (err, fallback = "Upload failed") => {
    const apiMessage = err?.response?.data?.message || err?.response?.data?.error?.message;
    const status = err?.response?.status;

    if (apiMessage) return apiMessage;
    if (status === 413) return "File is too large for server limit.";
    if (status === 403) return "Upload blocked by current plan limit.";
    if (status === 415) return "Unsupported file type.";
    return err?.message || fallback;
  };

const uploadSingleImage = async (file, attempt = 1) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error("No token found");
    }
    
    // Convert URI to blob
    const response = await fetch(file.uri);
    const blob = await response.blob();
    
    const formData = new FormData();
    const fileName = file.fileName || file.name || `photo_${Date.now()}.jpg`;
    formData.append('file', blob, fileName);
    formData.append('type', 'image');
    
    console.log(`🚀 Uploading: ${fileName}, Size: ${blob.size} bytes`);
    
    const uploadResponse = await fetch(`${BASE_URL}/vendor-profile/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`HTTP ${uploadResponse.status}`);
    }
    
    const data = await uploadResponse.json();
    console.log(`✅ Upload success`);
    return { success: true, data };
    
  } catch (err) {
    console.log(`❌ Upload failed:`, err.message);
    
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return uploadSingleImage(file, attempt + 1);
    }
    
    return { success: false, reason: err.message };
  }
};

  const pickImage = () => {
    if (!canUpload()) {
      Alert.alert(
        "Limit Reached",
        `Portfolio limit reached. Upgrade your plan for more storage.`
      );
      return;
    }

    launchImageLibrary(
      {
        mediaType: "photo",
    selectionLimit: 1, // पहले 1 image से test करें
    quality: 0.3, // और कम करें 0.3
    maxWidth: 800,
    maxHeight: 800,
    includeBase64: false,
      },
      async (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert("Error", "Failed to pick image");
          return;
        }

        if (response.assets && response.assets.length > 0) {
          // Filter only images
          const validFiles = [];
          const errors = [];

          for (const asset of response.assets) {
            // Check file size (10 MB limit)
            if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
              errors.push(`${asset.fileName || "Image"}: Exceeds 10 MB limit`);
              continue;
            }
            validFiles.push(asset);
          }

          // Cap at remaining quota
          const remaining = getRemainingUploads();
          const toUpload = remaining === Infinity ? validFiles : validFiles.slice(0, remaining);
          const skippedByLimit = validFiles.length - toUpload.length;

          if (toUpload.length === 0) {
            if (errors.length > 0) {
              Alert.alert("Upload Failed", errors.join("\n"));
            } else {
              Alert.alert(
                "Limit Reached",
                "Portfolio limit reached. Upgrade your plan for more storage."
              );
            }
            return;
          }

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
  
  // Upload one by one
  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    setUploadProgress(`${i + 1} / ${filesToUpload.length}`);
    
    console.log(`\n📸 Uploading ${i + 1}/${filesToUpload.length}: ${file.fileName}`);
    
    const result = await uploadSingleImage(file);
    
    if (result.success) {
      successCount++;
      console.log(`✅ Success (${successCount}/${filesToUpload.length})`);
    } else {
      failedFiles.push(`${file.fileName || "Image"}: ${result.reason}`);
      console.log(`❌ Failed: ${result.reason}`);
    }
    
    // Add delay between uploads
    if (i < filesToUpload.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // Refresh media after uploads
  await fetchMedia();
  
  // Show result message
  let message = "";
  if (successCount > 0) {
    message += `✅ ${successCount} file${successCount > 1 ? "s" : ""} uploaded — pending admin approval.\n\n`;
  }
  if (failedFiles.length > 0) {
    message += `❌ ${failedFiles.length} failed to upload.\n`;
    message += `Failed:\n${failedFiles.slice(0, 3).join("\n")}`;
    if (failedFiles.length > 3) {
      message += `\n...and ${failedFiles.length - 3} more`;
    }
  }
  
  if (skippedByLimit > 0) {
    message += `\n\n⚠️ ${skippedByLimit} file${skippedByLimit > 1 ? "s were" : " was"} skipped due to plan limit.`;
  }
  
  Alert.alert("Upload Complete", message || "No files uploaded");
  setUploading(false);
  setUploadProgress("");
};

  const handleDelete = async (mediaId) => {
    Alert.alert(
      "Delete Media",
      "Are you sure you want to delete this media?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest("delete", `/vendor-profile/media/${mediaId}`);
              await fetchMedia();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete media");
            }
          },
        },
      ]
    );
  };

  const handleToggleVisibility = async (mediaId) => {
    try {
      const response = await apiRequest("patch", `/vendor-profile/media/${mediaId}/toggle-visibility`);
      if (response.success) {
        setMedia(media.map((m) => (m._id === mediaId ? response.data : m)));
      }
    } catch (error) {
      console.error("Toggle visibility error:", error);
      Alert.alert("Error", "Failed to update visibility");
    }
  };

  const handleToggleFeatured = async (mediaId) => {
    try {
      const response = await apiRequest("patch", `/vendor-profile/media/${mediaId}/feature`);
      if (response.success) {
        setMedia(media.map((m) => (m._id === mediaId ? response.data : m)));
      }
    } catch (error) {
      console.error("Toggle featured error:", error);
      Alert.alert("Error", "Failed to update featured status");
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
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#7c3aed",
    marginLeft: 16,
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
    flexDirection : 'row',
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