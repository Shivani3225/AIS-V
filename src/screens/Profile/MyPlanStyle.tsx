// MyPlanStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  receiptModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4F46E5',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  receiptModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  receiptModalClose: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
  receiptActionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  printButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  downloadReceiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    gap: 8,
  },
  downloadReceiptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  infoNoteText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    borderRadius: 12,
    margin: 10,
    padding: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  statusActive: {
    backgroundColor: '#DCFCE7'
  },
  statusExpired: {
    backgroundColor: '#FEE2E2'
  },
  statusFree: {
    backgroundColor: '#E5E7EB'
  },
  content: {
    padding: 20,
  },
  countdownBanner: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  countdownBannerWarning: {
    backgroundColor: '#F59E0B',
  },
  countdownDays: {
    position: 'absolute',
    top: 12,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownDaysText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  countdownContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countdownIcon: {
    fontSize: 28,
    marginRight: 12,
    color: '#FFFFFF',
  },
  countdownTextContainer: {
    flex: 1,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  countdownDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  currentPlanDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    overflow: 'hidden',
  },
  currentPlanHeader: {
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  currentPlanSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentPlanInfo: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  infoValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  infoSmall: {
    fontSize: 11,
    color: '#6B7280',
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expiryWarning: {
    color: '#EF4444',
  },
  featuresSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureGridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureGridCheck: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 6,
  },
  featureGridText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  warningNotice: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    margin: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  warningBold: {
    fontWeight: 'bold',
  },
  upcomingPlanBanner: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  upcomingPlanContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  upcomingPlanIcon: {
    fontSize: 28,
    marginRight: 12,
    color: '#FFFFFF',
  },
  upcomingPlanTextContainer: {
    flex: 1,
  },
  upcomingPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  upcomingPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  upcomingPlanBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  upcomingPlanBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  upcomingPlanDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
    marginBottom: 8,
  },
  upcomingPlanBold: {
    fontWeight: 'bold',
  },
  upcomingPlanDuration: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  upcomingPlanDurationText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  changePlanButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    minWidth: 100,
    alignItems: 'center',
  },
  changePlanButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  renewButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  upgradeButton: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  expiredBanner: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  expiredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expiredIcon: {
    fontSize: 28,
    marginRight: 12,
    color: '#FFFFFF',
  },
  expiredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expiredDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  expiredBold: {
    fontWeight: 'bold',
  },
  expiredPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
    overflow: 'hidden',
  },
  expiredPlanHeader: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  expiredPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  expiredPlanInfo: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  expiredBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  expiredText: {
    color: '#EF4444',
  },
  reactivateBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  reactivateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reactivateSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  reactivateButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  reactivateButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  freePlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
  },
  freePlanHeader: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  freePlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  freePlanContent: {
    padding: 20,
    alignItems: 'center',
  },
  freePlanIconContainer: {
    backgroundColor: '#F3F4F6',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  freePlanIcon: {
    fontSize: 40,
    color: '#9CA3AF',
  },
  freePlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  freePlanDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  includedFeatures: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  includedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  excludedFeatures: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  excludedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkIcon: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 8,
  },
  xIcon: {
    fontSize: 12,
    color: '#EF4444',
    marginRight: 8,
  },
  featureRowText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  featureRowTextExcluded: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  bonusBanner: {
    backgroundColor: '#e6f4ea',
    borderColor: '#34c759',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
  },
  bonusBannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 12,
    color: '#065f46',
    lineHeight: 18,
  },
  bonusBold: {
    fontWeight: '700',
    color: '#065f46',
  },
  getStartedButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  getStartedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 20,
    overflow: 'hidden',
  },
  receiptHeader: {
    backgroundColor: '#10B981',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  downloadButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  receiptInfo: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  receiptItem: {
    width: '48%',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  receiptValueLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  paidBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    height: '90%',
  },
  modalHeader: {
    backgroundColor: '#4F46E5',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
 modalBonusBanner: {
  margin: 16,
  marginTop: 8,
  marginBottom: 8,
  backgroundColor: '#F0FDF4',
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: '#86EFAC',
  overflow: 'hidden',
},

modalBonusContent: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  flex: 1,
},

modalBonusIcon: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#10B981',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
  flexShrink: 0,
},

modalBonusTitle: {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#14532D',
  marginBottom: 4,
  flexWrap: 'wrap',
  flexShrink: 1,
},

modalBonusText: {
  fontSize: 10,
  color: '#14532D',
  lineHeight: 16,
  flexWrap: 'wrap',
  flexShrink: 1,
  marginBottom: 2,
},

modalBonusTextSmall: {
  fontSize: 10,
  color: '#14532D',
  lineHeight: 16,
  flexWrap: 'wrap',
  flexShrink: 1,
  opacity: 0.8,
},
  modalBonusBold: {
    fontWeight: 'bold',
  },
  modalError: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalErrorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
  },
  plansGrid: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  popularPlanCard: {
    backgroundColor: '#4F46E5',
    borderColor: '#FBBF24',
    borderWidth: 2,
  },
  currentPlanCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#FBBF24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  currentPlanBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIconText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  planNameLight: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  priceLight: {
    color: '#FFFFFF',
  },
  priceDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceDurationLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bonusBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  bonusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 8,
  },
  featureText: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  featureTextLight: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  purchaseButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    backgroundColor: '#10B981',
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  growthPlanButton: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  growthPlanButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#ffff',
  },
 modalInfo: {
  flexDirection: 'row',
  backgroundColor: '#F5F3FF',  // Add background color
  borderRadius: 12,            // Add border radius for card look
  padding: 14,                 // Slightly increased padding
  margin: 16,
  marginTop: 8,
  marginBottom: 20,
  borderWidth: 1,              // Add border
  borderColor: '#EDE9FE',      // Light purple border
  shadowColor: '#000',         // Add subtle shadow
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
  overflow: 'hidden',          // Ensure content stays inside
},

modalInfoIconWrapper: {
  width: 28,
  height: 28,
  borderRadius: 14,            // Make icon wrapper rounded
  backgroundColor: '#EDE9FE',  // Add background to icon
  alignItems: 'center',        // Center the icon
  justifyContent: 'center',    // Center the icon
  marginRight: 12,
},

modalInfoTextWrapper: {
  flex: 1,
  flexShrink: 1,               // Prevent text overflow
},

modalInfoHeading: {
  fontSize: 12,
  fontWeight: '700',
  color: '#1F2937',
  marginBottom: 4,             // Slightly increased
},

modalInfoDescription: {
  fontSize: 11,
  lineHeight: 16,
  color: '#4B5563',            // Slightly darker for better readability
  flexWrap: 'wrap',            // Ensure text wraps
  flexShrink: 1,               // Prevent text overflow
},
});