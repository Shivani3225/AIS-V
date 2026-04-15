import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = 'https://api.aissignatureevent.com/api';

const Reviews = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("vendorToken");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // API request helper
  const apiRequest = async (method, endpoint, data = null) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers,
        timeout: 120000,
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      if (error.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Please login again",
          [
            {
              text: "Login",
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      }
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest("get", "/vendor-profile/reviews");
      if (res.success) {
        setReviews(res.data || []);
      } else {
        setError("Could not load reviews.");
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartReply = (review) => {
    setReplyingTo(review._id);
    setReplyText(review.vendorResponse?.comment || "");
    setModalVisible(true);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
    setModalVisible(false);
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      setSubmitting(true);
      const res = await apiRequest("post", `/vendor-profile/reviews/${reviewId}/reply`, {
        comment: replyText.trim(),
      });
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? res.data : r))
        );
        handleCancelReply();
        Alert.alert("Success", "Reply posted successfully!");
      }
    } catch (error) {
      console.error("Reply error:", error);
      Alert.alert("Error", "Failed to post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const renderStars = (rating, size = "small") => {
    const starSize = size === "large" ? 20 : 16;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon
            key={i}
            name={i <= rating ? "star" : "star-outline"}
            size={starSize}
            color={i <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  const avatarColor = (name = "") => {
    const colors = [
      "#6366F1",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#3B82F6",
      "#F97316",
    ];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Derived stats
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const repliedCount = reviews.filter((r) => r.vendorResponse?.comment).length;
  const pendingCount = reviews.length - repliedCount;

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    stars: n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === n).length / reviews.length) * 100
        )
      : 0,
  }));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading reviews…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
            <Icon name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcon name="star-border" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>
            Once customers leave reviews and they are approved, they will appear
            here for you to read and respond.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
      {/* Summary Header */}
<View style={styles.summaryCard}>
  {/* Average Rating - Centered at top */}
  <View style={styles.ratingSection}>
    <Text style={styles.avgRating}>{avgRating}</Text>
    {renderStars(Math.round(Number(avgRating)), "large")}
    <Text style={styles.reviewCount}>
      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
    </Text>
  </View>

  {/* Rating Distribution */}
  <View style={styles.distributionSection}>
    <Text style={styles.distributionTitle}>Rating Distribution</Text>
    {ratingDist.map(({ stars, count, pct }) => (
      <View key={stars} style={styles.distributionRow}>
        <View style={styles.starLabel}>
          <Text style={styles.starNumber}>{stars}</Text>
          <Icon name="star" size={14} color="#F59E0B" />
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${pct}%` },
            ]}
          />
        </View>
        <Text style={styles.countText}>{count}</Text>
      </View>
    ))}
  </View>

  {/* Stats Chips - Side by side */}
  <View style={styles.statsSection}>
    <View style={[styles.statChip, styles.repliedChip]}>
      <MaterialIcon name="check-circle" size={20} color="#059669" />
      <View>
        <Text style={styles.statNumber}>{repliedCount}</Text>
        <Text style={styles.statLabel}>Replied</Text>
      </View>
    </View>
    <View style={[styles.statChip, styles.pendingChip]}>
      <MaterialIcon name="access-time" size={20} color="#D97706" />
      <View>
        <Text style={styles.statNumber}>{pendingCount}</Text>
        <Text style={styles.statLabel}>Awaiting reply</Text>
      </View>
    </View>
  </View>

  {pendingCount > 0 && (
    <View style={styles.tipContainer}>
      <MaterialIcon name="trending-up" size={16} color="#D97706" />
      <Text style={styles.tipText}>
        Responding to reviews builds trust — you have{" "}
        <Text style={styles.tipBold}>{pendingCount}</Text> unanswered
        review{pendingCount !== 1 ? "s" : ""}.
      </Text>
    </View>
  )}
</View>
        {/* Review Cards */}
        {reviews.map((review) => {
          const userName = review.userId?.name || review.userName || "Anonymous";
          const hasReply = !!review.vendorResponse?.comment;

          return (
            <View key={review._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: avatarColor(userName) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.reviewInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{userName}</Text>
                    {review.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialIcon name="verified" size={12} color="#059669" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.starsDateRow}>
                    {renderStars(review.rating)}
                    <Text style={styles.dateText}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{review.comment}</Text>
                </View>
              </View>

              {/* Existing Vendor Response */}
              {hasReply && (
                <View style={styles.responseContainer}>
                  <View style={styles.responseHeader}>
                    <Text style={styles.responseTitle}>Your Response</Text>
                    <Text style={styles.responseDate}>
                      {formatDate(review.vendorResponse.respondedAt)}
                    </Text>
                  </View>
                  <Text style={styles.responseText}>
                    {review.vendorResponse.comment}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionBar}>
                <View style={styles.statusBadge}>
                  {hasReply ? (
                    <>
                      <MaterialIcon name="check-circle" size={14} color="#059669" />
                      <Text style={styles.respondedText}>Responded</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="access-time" size={14} color="#D97706" />
                      <Text style={styles.pendingText}>No response yet</Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.replyButton, hasReply && styles.editButton]}
                  onPress={() => handleStartReply(review)}
                >
                  <Icon
                    name={hasReply ? "create-outline" : "chatbubble-outline"}
                    size={16}
                    color={hasReply ? "#6366F1" : "#fff"}
                  />
                  <Text
                    style={[
                      styles.replyButtonText,
                      hasReply && styles.editButtonText,
                    ]}
                  >
                    {hasReply ? "Edit Response" : "Reply"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        
        {/* Add extra space at the bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelReply}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {replyText ? "Edit Your Response" : "Write Your Response"}
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.replyInput}
              multiline
              numberOfLines={6}
              placeholder="Write a professional, helpful response to this customer's review…"
              placeholderTextColor="#9CA3AF"
              value={replyText}
              onChangeText={setReplyText}
              maxLength={500}
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>
              {replyText.length}/500 characters
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelReply}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!replyText.trim() || submitting) && styles.disabledButton,
                ]}
                onPress={() => handleSubmitReply(replyingTo)}
                disabled={!replyText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="send-outline" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      {replyText ? "Update Response" : "Post Response"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, 
  },
  bottomSpacing: {
    height: 20, 
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    margin : 15,
    borderRadius : 10
  },
  starsContainer: {
  flexDirection: "row",
  gap: 4,
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
    color: "#6366F1",
    marginLeft: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
 summaryCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  margin: 16,
  padding: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
ratingSection: {
  alignItems: "center",
  backgroundColor: "#EEF2FF",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
},
avgRating: {
  fontSize: 52,
  fontWeight: "800",
  color: "#6366F1",
  marginBottom: 8,
},
reviewCount: {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 8,
},
distributionSection: {
  marginBottom: 20,
},
distributionTitle: {
  fontSize: 14,
  fontWeight: "600",
  color: "#374151",
  marginBottom: 12,
},
distributionRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},
starLabel: {
  flexDirection: "row",
  alignItems: "center",
  width: 40,
  gap: 4,
},
starNumber: {
  fontSize: 14,
  fontWeight: "600",
  color: "#6B7280",
},
progressBarContainer: {
  flex: 1,
  height: 8,
  backgroundColor: "#E5E7EB",
  borderRadius: 4,
  overflow: "hidden",
  marginHorizontal: 12,
},
progressBar: {
  height: "100%",
  backgroundColor: "#F59E0B",
  borderRadius: 4,
},
countText: {
  fontSize: 13,
  color: "#6B7280",
  width: 35,
  textAlign: "right",
  fontWeight: "500",
},
statsSection: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
},
statChip: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 12,
  gap: 10,
},
repliedChip: {
  backgroundColor: "#D1FAE5",
  borderWidth: 1,
  borderColor: "#A7F3D0",
},
pendingChip: {
  backgroundColor: "#FEF3C7",
  borderWidth: 1,
  borderColor: "#FDE68A",
},
statNumber: {
  fontSize: 20,
  fontWeight: "700",
  color: "#111827",
},
statLabel: {
  fontSize: 11,
  fontWeight: "500",
  color: "#6B7280",
},
tipContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FEF3C7",
  padding: 12,
  borderRadius: 12,
  gap: 8,
},
tipText: {
  fontSize: 12,
  color: "#D97706",
  flex: 1,
  lineHeight: 18,
},
tipBold: {
  fontWeight: "700",
},
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  reviewInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#059669",
  },
  starsDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: 12,
    marginLeft: 56,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    padding: 12,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  responseTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
    textTransform: "uppercase",
  },
  responseDate: {
    fontSize: 10,
    color: "#8B5CF6",
  },
  responseText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  respondedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  editButtonText: {
    color: "#6366F1",
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
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    backgroundColor: "#F9FAFB",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "right",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Reviews;