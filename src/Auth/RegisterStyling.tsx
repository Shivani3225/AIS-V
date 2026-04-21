import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },

  header: {
    padding: 25,
    paddingTop: 40,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
// Add these new styles for the photos step

photoSubtitle: {
  fontSize: 14,
  color: '#6B7280',
  marginTop: 4,
  marginBottom: 16,
  lineHeight: 20,
},

tipBox: {
  flexDirection: 'row',
  backgroundColor: '#EFF6FF',
  padding: 12,
  borderRadius: 8,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#DBEAFE',
},

tipText: {
  flex: 1,
  fontSize: 13,
  color: '#1E40AF',
  marginLeft: 10,
  lineHeight: 18,
},

divider: {
  height: 1,
  backgroundColor: '#E5E7EB',
  marginVertical: 20,
},

uploadTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
  marginBottom: 16,
},

uploadArea: {
  backgroundColor: '#F9FAFB',
  borderWidth: 2,
  borderColor: '#E5E7EB',
  borderStyle: 'dashed',
  borderRadius: 12,
  padding: 24,
  alignItems: 'center',
  marginBottom: 24,
},

uploadAreaText: {
  fontSize: 15,
  color: '#4B5563',
  marginTop: 12,
  marginBottom: 16,
},

uploadRequirements: {
  alignItems: 'center',
  marginBottom: 20,
},

requirementText: {
  fontSize: 13,
  color: '#6B7280',
  marginBottom: 4,
},

chooseButton: {
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
},

chooseButtonText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '600',
},

previewContainer: {
  marginTop: 10,
},

previewTitle: {
  fontSize: 15,
  fontWeight: '600',
  color: '#1F2937',
  marginBottom: 12,
},

photoPreviewGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
},

previewItem: {
  width: 100,
  height: 100,
  borderRadius: 8,
  position: 'relative',
  overflow: 'hidden',
},

previewImage: {
  width: '100%',
  height: '100%',
},

removeButton: {
  position: 'absolute',
  top: 5,
  right: 5,
  backgroundColor: '#EF4444',
  width: 22,
  height: 22,
  borderRadius: 11,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},

fileInfoBadge: {
  position: 'absolute',
  bottom: 5,
  left: 5,
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
},

fileInfoText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: '500',
},

emptyPreview: {
  width: 100,
  height: 100,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderStyle: 'dashed',
  justifyContent: 'center',
  alignItems: 'center',
},
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },

  stepsScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
// Add these new styles for password hints

passwordHintContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 6,
  marginBottom: 10,
  paddingHorizontal: 4,
},

passwordHintText: {
  fontSize: 12,
  color: '#6B7280',
  marginLeft: 6,
},

errorHintText: {
  color: '#EF4444',
},

successHintText: {
  color: '#10B981',
},
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingRight: 30,
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepCircle: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  stepCircleActive: {
    backgroundColor: '#8B5CF6',
  },

  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#fff',
  },

  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  stepNumberActive: {
    color: '#fff',
  },

  stepTextContainer: {
    marginRight: 8,
  },

  stepTitle: {
   // fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  stepTitleActive: {
    color: '#1F2937',
  },

  optionalText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },

  stepArrow: {
    marginHorizontal: 8,
  },

  content: {
    padding: 20,
  },

  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

 

  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 10,
    padding: 0,
  },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  categoryList: {
    marginBottom: 24,
  },

  categoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  categoryItemText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
  },

  manualContainer: {
    marginTop: 8,
  },

  manualTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  manualSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },

  manualInputBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
  },

  manualInput: {
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    flex: 1,
  },
// Add these new styles for the timing section

sectionLabel: {
  fontSize: 15,
  fontWeight: '600',
  color: '#1F2937',
  marginTop: 16,
  marginBottom: 12,
},

daysContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 20,
},

dayChip: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 25,
  backgroundColor: '#F3F4F6',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  minWidth: 50,
  alignItems: 'center',
},

selectedDayChip: {
  backgroundColor: '#8B5CF6',
  borderColor: '#8B5CF6',
},

dayChipText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#4B5563',
},

selectedDayChipText: {
  color: '#FFFFFF',
},

timeSection: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},

timeLabelContainer: {
  width: 100,
},

timeLabel: {
  fontSize: 15,
  fontWeight: '500',
  color: '#1F2937',
},

timePickerBox: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginLeft: 10,
},

timePickerText: {
  fontSize: 15,
  color: '#1F2937',
  fontWeight: '500',
},

addTimingBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 14,
  marginTop: 20,
  borderWidth: 1,
  borderColor: '#8B5CF6',
  borderRadius: 8,
  borderStyle: 'dashed',
  backgroundColor: '#F5F3FF',
},

addTimingText: {
  marginLeft: 8,
  color: '#8B5CF6',
  fontWeight: '500',
  fontSize: 14,
},
  
  // Input styles
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 6,
    
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#1F2937',
  },

  // Time styles
  timeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  timeText: {
    fontSize: 14,
    color: '#374151',
  },

  toText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
  },

 
//2 case stylnng
// Add these new styles to your existing StyleSheet

rowContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 8,
  gap: 12,
},

halfContainer: {
  flex: 1,
},

dropdownBox: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 12,
  //marginHorizontal: 16,
  backgroundColor: '#dedbdb',
  height: 48,
  marginTop: 6,
},

dropdownText: {
  fontSize: 14,
  color: '#1F2937',
  flex: 1,
},

placeholderText: {
  color: '#9CA3AF',
},

textAreaBox: {
  minHeight: 50,
  alignItems: 'flex-start',
 // paddingTop: 12,
},

textAreaIcon: {
  marginTop: 2,
},

textArea: {
  height: 70,
  textAlignVertical: 'top',
},

// Update your existing inputBox style if needed
inputBox: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 10,
  
  backgroundColor: '#F9FAFB',
  marginTop: 8,
  height: 45,
},
pincodebox:{
   flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 10,
  backgroundColor: '#F9FAFB',
  marginTop: 10,
  height: 45,
  marginHorizontal: 10,  
},
input: {
  flex: 1,
  fontSize: 14,
  color: '#1F2937',
  padding: 0,
  marginLeft: 8,
},
  // Photo styles
  photoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  photoUploadBox: {
    width: '48%',
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoUploadText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },

  photoPreviewRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  photoPreview: {
    width: 70,
    height: 70,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginRight: 10,
    position: 'relative',
  },

  removePhoto: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },

  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },

  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  continueButton: {
    flex: 2,
  },

  fullWidthButton: {
    flex: 3,
  },

  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },

  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },

  // Error styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },

  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },

  selectedCategoryItem: {
    backgroundColor: '#F5F3FF',
    borderBottomColor: '#8B5CF6',
  },

  selectedCategoryText: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  //case 6
  pricingCard: {
  backgroundColor: "#F9FAFB",
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: "#E5E7EB"
},

pricingHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 20
},

numberCircle: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#E0E7FF",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10
},

numberText: {
  color: "#4F46E5",
  fontWeight: "600"
},

pricingTitle: {
  fontSize: 16,
  fontWeight: "600",
  color: "#111827"
},

priceRow: {
  flexDirection: "row",
  justifyContent: "space-between"
},

priceBox: {
  width: "48%"
},

label: {
  fontSize: 14,
  color: "#374151",
  marginBottom: 6
},

inputWrapper: {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 8,
  paddingHorizontal: 10,
  height: 44,
  backgroundColor: "#FFFFFF"
},

input: {
  flex: 1,
  marginLeft: 6,
  fontSize: 15
},



stepSubtitle: {
  fontSize: 14,
  color: "#6B7280",
  marginTop: 4
},
// Success Modal Styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

modalContent: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 24,
  width: '100%',
  maxWidth: 340,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},

successIconWrapper: {
  marginBottom: 20,
},

successIconCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#10B981',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#10B981',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 5,
},

modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#1F2937',
  marginBottom: 12,
  textAlign: 'center',
},

modalMessage: {
  fontSize: 14,
  color: '#6B7280',
  textAlign: 'center',
  lineHeight: 20,
  marginBottom: 20,
  paddingHorizontal: 8,
},

modalInfoCard: {
  backgroundColor: '#FEF3C7',
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
  width: '100%',
  borderLeftWidth: 4,
  borderLeftColor: '#F59E0B',
},

modalInfoHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 8,
},

modalInfoTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#92400E',
},

modalInfoText: {
  fontSize: 13,
  color: '#78350F',
  lineHeight: 18,
  textAlign: 'left',
},

modalLoginButton: {
  width: '100%',
  marginBottom: 12,
  borderRadius: 12,
  overflow: 'hidden',
},

modalLoginGradient: {
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

modalLoginText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},

modalHomeLink: {
  paddingVertical: 8,
  paddingHorizontal: 16,
},

modalHomeLinkText: {
  color: '#6B7280',
  fontSize: 14,
  textDecorationLine: 'underline',
},
dropdownBox: {
  marginTop: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  paddingHorizontal: 12,
 // marginHorizontal: 10,
  height: 46,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
 backgroundColor: '#F9FAFB',
},

dropdownText: {
  fontSize: 14,
  color: "#111827"
},

dropdownList: {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 8,
  marginTop: 6,
  backgroundColor: "#FFFFFF",
  overflow: "hidden"
},

dropdownItem: {
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6"
},

dropdownItemText: {
  fontSize: 14,
  color: "#374151"
},
descriptionInput: {
  marginTop: 10,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  padding: 12,
  minHeight: 120,
  textAlignVertical: "top",
  fontSize: 14,
  color: "#111827",
  backgroundColor: "#FFFFFF"
},

descriptionFooter: {
  flexDirection: "row",
  justifyContent: "flex-start",  // Change from "space-between" to "flex-start"
  alignItems: "center",
  marginTop: 6,
  flexWrap: "wrap",  // Add this to prevent text from going outside
},

helperText: {
  fontSize: 13,
  color: "#6B7280",
  marginRight: 10,  // Add space between helper text and counter text
},

counterText: {
  fontSize: 12,
  color: "#9CA3AF",
  textAlign: 'left',
},
importantBox: {
  marginTop: 20,
  backgroundColor: "#FFF7ED",
  borderWidth: 1,
  borderColor: "#FCD34D",
  borderRadius: 10,
  padding: 14
},

importantHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6
},

importantTitle: {
  marginLeft: 6,
  fontSize: 14,
  fontWeight: "600",
  color: "#B45309"
},

importantText: {
  fontSize: 13,
  color: "#92400E",
  lineHeight: 18
},  
//case 7 styling
infoBox: {
  marginTop: 20,
  backgroundColor: "#EFF6FF",
  borderWidth: 1,
  borderColor: "#93C5FD",
  borderRadius: 10,
  padding: 12,
  flexDirection: "row",
  alignItems: "center"
},

infoText: {
  marginLeft: 8,
  fontSize: 13,
  color: "#1D4ED8",
  flex: 1
},

bonusBox: {
  marginTop: 14,
  backgroundColor: "#ECFDF5",
  borderWidth: 1,
  borderColor: "#34D399",
  borderRadius: 12,
  padding: 14
},

bonusHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6
},

bonusTitle: {
  fontSize: 14,
  fontWeight: "600",
  color: "#065F46"
},

bonusText: {
  fontSize: 13,
  color: "#047857",
  marginTop: 4
},

bonusSubText: {
  fontSize: 12,
  color: "#059669",
  marginTop: 4
},
//plan styling
scrollContent: {
    padding: 16,
  },
  stepContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  bonusBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  bonusHeader: {
    marginBottom: 8,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  bonusText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 6,
    fontWeight: '500',
  },
  bonusSubText: {
    fontSize: 13,
    color: '#4B7B5C',
  },
  
 
  planCardSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#F9FAFB',
  },
  mostPopularCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  mostPopularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  mostPopularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
planCard:{
backgroundColor:"#fff",
borderRadius:18,
padding:20,
marginBottom:18,

shadowColor:"#000",
shadowOffset:{width:0,height:3},
shadowOpacity:0.1,
shadowRadius:6,
elevation:4
},

activePlan:{
borderWidth:2,
borderColor:"#22C55E",
backgroundColor:"#F0FDF4"
},

popularBadge:{
position:"absolute",
top:-12,
right:20,
backgroundColor:"#6D28D9",
paddingHorizontal:12,
paddingVertical:10,
borderRadius:20
},

popularText:{
color:"#fff",
fontSize:12,
fontWeight:"600"
},

planIcon:{
width:50,
height:50,
borderRadius:25,
backgroundColor:"#EDE9FE",
alignItems:"center",
justifyContent:"center",
alignSelf:"center",
marginBottom:10
},

planTitle:{
fontSize:18,
fontWeight:"600",
alignItems:"center",
justifyContent:"center",
alignSelf:"center",
},

planPrice:{
fontSize:20,
fontWeight:"600",
marginVertical:6,
alignItems:"center",
justifyContent:"center",
alignSelf:"center",
color:"#2d8a2f"
},
checkCircle:{
  width:18,
  height:18,
  borderRadius:9,
  backgroundColor:"#16A34A",
  justifyContent:"center",
  alignItems:"center",
  marginRight:6
},


featureRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:6,

},

featureText:{
marginLeft:8,
fontSize:14,
color:"#374151",
alignItems:"center",
justifyContent:"center",
alignSelf:"center",
},

planButton:{
marginTop:12,
alignItems:"center"
},

selectText:{
color:"#374151",
fontWeight:"500"
},

selectedBtn:{
flexDirection:"row",
alignItems:"center"
},

selectedText:{
color:"#16A34A",
fontWeight:"600"
},
upgradecontainer:{
backgroundColor:"#F5F3FF",
borderWidth:1,
borderColor:"#C4B5FD",
borderRadius:12,
padding:16,
marginTop:16
},

upgradeiconRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:6
},

upgradetitle:{
fontSize:16,
fontWeight:"600",
marginLeft:6,
color:"#1F2937"
},

upgradedescription:{
fontSize:14,
color:"#4B5563",
lineHeight:20
},
////////////////////////////////////
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  modalDetails: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  modalDetailItem: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    paddingLeft: 8,
  },
  modalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  // Additional styles needed

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  passwordHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  passwordHintText: {
    fontSize: 12,
    marginLeft: 5,
    color: '#6B7280',
  },
  errorHintText: {
    color: '#EF4444',
  },
  successHintText: {
    color: '#10B981',
  },
  importantBox: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  importantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  importantTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 5,
  },
  importantText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  upgradecontainer: {
    backgroundColor: '#F5F3FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  upgradeiconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradetitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    marginLeft: 8,
  },
  upgradedescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },

////////
 scrollContent: {
    flexGrow: 1,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownList: {
    padding: 4,
  },
  dropdownHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedDropdownItem: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  dropdownItemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingDropdown: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyDropdown: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cityDropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffff',
   
    borderRadius: 10,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  citySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c6c6c7',
    backgroundColor: '#ffff',
  },
  citySearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    padding: 4,
    color: '#1F2937',
  },
  cityDropdownList: {
    maxHeight: 180,
  },
  cityDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCityItem: {
    backgroundColor: '#828282',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  cityState: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  areaDropdownContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  areaSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    padding: 4,
    color: '#1F2937',
  },
  areaDropdownList: {
    maxHeight: 180,
  },
  areaDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedAreaItem: {
    backgroundColor: '#EEF2FF',
  },
  areaName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  disabledDropdown: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
 modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  timePickerBody: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    height: 250,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timePickerColumnLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
  },
  timePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 2,
  },
  timePickerItemSelected: {
    backgroundColor: '#5B5BEA',
  },
  timePickerItemText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
  },
  timePickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timePickerFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timePickerCancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  timePickerCancelText: {
    color: '#6B7280',
    fontSize: 16,
  },
  timePickerConfirmBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#5B5BEA',
  },
  timePickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSection: {
    marginBottom: 20,
  },
  timeLabelContainer: {
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timePickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  timePickerText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  clockIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  paymentReminderBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEF3C7',
  padding: 12,
  borderRadius: 10,
  marginVertical: 10,
  gap: 10,
},
paymentReminderText: {
  flex: 1,
  fontSize: 13,
  color: '#92400E',
  lineHeight: 18,
},


});
export default styles;