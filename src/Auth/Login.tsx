



// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ScrollView,
// //   TextInput,
// //   TouchableOpacity,
// //   Image,
// //   ActivityIndicator,
// // } from 'react-native';
// // import { useNavigation } from "@react-navigation/native";
// // import LinearGradient from 'react-native-linear-gradient';
// // import Icon from 'react-native-vector-icons/Feather';
// // import axios from 'axios';
// // import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// // Icon.loadFont();

// // const BASE_URL = 'https://api.aissignatureevent.com/api';

// // const Login = () => {
// //   const navigation = useNavigation();
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [googleLoading, setGoogleLoading] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState("");
// //   const [successMessage, setSuccessMessage] = useState("");

// //   // Configure Google Sign-In
// //   useEffect(() => {
// //     GoogleSignin.configure({
// //       webClientId: '184582264363-5r4gvb0baskihkg4c09crl0fccsaoon8.apps.googleusercontent.com',
// //       offlineAccess: true,
// //       forceCodeForRefreshToken: true,
// //     });
    
// //     console.log("✅ Google Sign-In configured");
// //   }, []);

// //   const handleLogin = async () => {
// //     setErrorMessage("");
// //     setSuccessMessage("");

// //     if (!email || !password) {
// //       setErrorMessage("Email and password are required");
// //       return;
// //     }

// //     try {
// //       setLoading(true);

// //       const response = await axios.post(`${BASE_URL}/vendors/login`, {
// //         email,
// //         password,
// //       });

// //       const data = response?.data ?? {};
// //       console.log("Login response:", data);

// //       if (data.success) {
// //         await AsyncStorage.setItem("vendorToken", data.token);
// //         await AsyncStorage.setItem("vendorData", JSON.stringify(data.data));
        
// //         const vendorId = data.data?.vendorId || data.data?._id || data.vendorId;
// //         if (vendorId) {
// //           await AsyncStorage.setItem("vendorId", vendorId);
// //           console.log("✅ VendorId saved:", vendorId);
// //         }

// //         setSuccessMessage(data.message || "Login successful");

// //         setTimeout(() => {
// //           navigation.replace("DashboardScreen");
// //         }, 1000);
// //       } else {
// //         setErrorMessage(data.error?.message || "Login failed");
// //       }
// //     } catch (error) {
// //       console.log("Login error:", error.response?.data || error.message);
// //       if (error.response?.data?.error?.message) {
// //         setErrorMessage(error.response.data.error.message);
// //       } else {
// //         setErrorMessage("Invalid email or password");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleForgotPassword = () => {
// //     navigation.navigate('ForgotPassword');
// //   };

// //   const handleGoogleSignIn = async () => {
// //   setGoogleLoading(true);
// //   setErrorMessage("");
// //   setSuccessMessage("");

// //   try {
// //     console.log("🔵 ========== STARTING GOOGLE SIGN-IN ==========");
    
// //     // Check if Google Play Services are available
// //     console.log("🔵 Step 1: Checking Google Play Services...");
// //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
// //     console.log("✅ Google Play Services are available");
    
// //     // Get user info from Google
// //     console.log("🔵 Step 2: Attempting to sign in with Google...");
// //     const userInfo = await GoogleSignin.signIn();
// //     console.log("✅ Google Sign-In successful!");
// //     console.log("📱 Full userInfo response:", JSON.stringify(userInfo, null, 2));
    
// //     // FIX: Extract data from the wrapper
// //     // The response has structure: { type: "success", data: { idToken, user, ... } }
// //     const responseData = userInfo?.data || userInfo;
    
// //     console.log("🔵 Step 3: Extracting data from response");
// //     console.log("📱 Extracted responseData keys:", Object.keys(responseData));
    
// //     // Now extract idToken and user from the correct location
// //     const idToken = responseData?.idToken;
// //     const user = responseData?.user;
    
// //     console.log("📱 idToken present:", !!idToken);
// //     console.log("📱 idToken value (first 50 chars):", idToken ? idToken.substring(0, 50) + "..." : "NOT FOUND");
// //     console.log("📱 user object present:", !!user);
    
// //     if (!idToken) {
// //       console.error("❌ CRITICAL: No idToken in response!");
// //       console.log("📱 Available keys in responseData:", Object.keys(responseData || {}));
// //       throw new Error("No ID token received from Google. Please check Firebase configuration.");
// //     }
    
// //     console.log("🔵 User ID:", user?.id);
// //     console.log("🔵 User Email:", user?.email);
// //     console.log("🔵 User Name:", user?.name);
// //     console.log("🔵 ID Token length:", idToken.length);
    
// //     // Send token to backend
// //     console.log("🔵 Step 4: Sending token to backend API...");
// //     console.log("📡 API Endpoint:", `${BASE_URL}/vendors/google-login`);
// //     console.log("📡 Request body:", { token: idToken.substring(0, 50) + "..." });
    
// //     const response = await axios.post(`${BASE_URL}/vendors/google-login`, {
// //       token: idToken
// //     });
    
// //     console.log("✅ Backend response received!");
// //     console.log("📡 Response status:", response.status);
// //     console.log("📡 Response data:", JSON.stringify(response.data, null, 2));
    
// //     const data = response?.data ?? {};
    
// //     if (data.success) {
// //       console.log("✅ Google login successful on backend!");
      
// //       // Store vendor data
// //       await AsyncStorage.setItem("vendorToken", data.token);
// //       await AsyncStorage.setItem("vendorData", JSON.stringify(data.data));
      
// //       const vendorId = data.data?.vendorId || data.data?._id;
// //       if (vendorId) {
// //         await AsyncStorage.setItem("vendorId", vendorId);
// //         console.log("✅ VendorId saved:", vendorId);
// //       }
      
// //       if (data.data?.businessName) {
// //         await AsyncStorage.setItem("vendorBusinessName", data.data.businessName);
// //         console.log("✅ Business name saved:", data.data.businessName);
// //       }
      
// //       if (data.data?.email) {
// //         await AsyncStorage.setItem("vendorEmail", data.data.email);
// //         console.log("✅ Email saved:", data.data.email);
// //       }
      
// //       setSuccessMessage(data.message || "Google login successful");
// //       console.log("🔵 Step 5: Navigation to Dashboard in 1 second...");
      
// //       setTimeout(() => {
// //         navigation.replace("DashboardScreen");
// //       }, 1000);
// //     } else {
// //       console.log("❌ Backend login failed!");
// //       console.log("❌ Error details:", data.error);
// //       setErrorMessage(data.error?.message || data.message || "Google login failed");
// //     }
    
// //     console.log("🔵 ========== GOOGLE SIGN-IN COMPLETED ==========");
    
// //   } catch (error) {
// //     console.log("❌❌❌ ========== GOOGLE SIGN-IN ERROR ========== ❌❌❌");
// //     console.log("Error code:", error.code);
// //     console.log("Error message:", error.message);
    
// //     if (error.response) {
// //       console.log("📡 Error response status:", error.response.status);
// //       console.log("📡 Error response data:", JSON.stringify(error.response.data, null, 2));
// //     }
    
// //     // Handle different error types
// //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
// //       console.log("⚠️ User cancelled the sign-in");
// //       setErrorMessage("You cancelled the sign-in process");
// //     } else if (error.code === statusCodes.IN_PROGRESS) {
// //       console.log("⚠️ Sign-in already in progress");
// //       setErrorMessage("Sign-in is already in progress");
// //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
// //       console.log("⚠️ Play Services not available");
// //       setErrorMessage("Google Play Services is not available");
// //     } else if (error.response?.data?.error?.code === 'VENDOR_NOT_FOUND') {
// //       console.log("⚠️ Vendor not found in database");
// //       setErrorMessage("No vendor account found with this email. Please register first.");
// //     } else if (error.response?.data?.error?.code === 'ACCOUNT_PENDING_APPROVAL') {
// //       console.log("⚠️ Account pending admin approval");
// //       setErrorMessage("Your account is pending admin approval. You will be able to login once activated.");
// //     } else if (error.response?.data?.error?.message) {
// //       setErrorMessage(error.response.data.error.message);
// //     } else {
// //       setErrorMessage(error.message || "An error occurred during Google sign-in");
// //     }
// //   } finally {
// //     setGoogleLoading(false);
// //   }
// // };

// //   return (
// //     <ScrollView
// //       style={styles.container}
// //       showsVerticalScrollIndicator={true}
// //       contentContainerStyle={styles.scrollContent}
// //     >
// //       <View style={styles.card}>
// //         {/* HEADER */}
// //         <LinearGradient
// //           colors={['#5B5BEA', '#8A3BD1', '#E11D48']}
// //           style={styles.header}
// //         >
// //           <Text style={styles.title}>Vendor Portal</Text>
// //           <Text style={styles.subtitle}>Sign in to manage your business</Text>
// //         </LinearGradient>

// //         {/* VENDOR ACCESS BANNER */}
// //         <View style={styles.vendorcontainer}>
// //           <LinearGradient
// //             colors={['#7C3AED', '#EC4899']}
// //             style={styles.iconBox}
// //           >
// //             <Icon name="briefcase" size={18} color="#fff" />
// //           </LinearGradient>

// //           <View style={styles.vendortextContainer}>
// //             <Text style={styles.vendortitle}>Vendor Access</Text>
// //             <Text style={styles.vendorsubtitle}>
// //               Manage your business dashboard
// //             </Text>
// //           </View>
// //         </View>

// //         <View style={styles.form}>
// //           {/* ERROR MESSAGE */}
// //           {errorMessage ? (
// //             <View style={styles.errorContainer}>
// //               <Icon name="alert-circle" size={16} color="#EF4444" />
// //               <Text style={styles.errorText}>{errorMessage}</Text>
// //             </View>
// //           ) : null}

// //           {/* SUCCESS MESSAGE */}
// //           {successMessage ? (
// //             <View style={styles.successContainer}>
// //               <Icon name="check-circle" size={16} color="#16A34A" />
// //               <Text style={styles.successText}>{successMessage}</Text>
// //             </View>
// //           ) : null}

// //           {/* EMAIL */}
// //           <Text style={styles.label}>Email Address *</Text>
// //           <View style={styles.inputBox}>
// //             <Icon name="mail" size={18} color="#8E8E98" />
// //             <TextInput
// //               placeholder="your@email.com"
// //               style={styles.input}
// //               keyboardType="email-address"
// //               autoCapitalize="none"
// //               value={email}
// //               onChangeText={setEmail}
// //             />
// //           </View>

// //           {/* PASSWORD */}
// //           <Text style={styles.label}>Password *</Text>
// //           <View style={styles.inputBox}>
// //             <Icon name="lock" size={18} color="#8E8E98" />
// //             <TextInput
// //               placeholder="Enter your password"
// //               secureTextEntry={!showPassword}
// //               style={styles.input}
// //               value={password}
// //               onChangeText={setPassword}
// //             />
// //             <TouchableOpacity
// //               onPress={() => setShowPassword(prev => !prev)}
// //               activeOpacity={0.7}
// //               style={styles.eyeIcon}
// //             >
// //               <Icon
// //                 name={showPassword ? "eye-off" : "eye"}
// //                 size={18}
// //                 color="#8E8E98"
// //               />
// //             </TouchableOpacity>
// //           </View>

// //           <TouchableOpacity onPress={handleForgotPassword}>
// //             <Text style={styles.forgot}>Forgot Password?</Text>
// //           </TouchableOpacity>

// //           {/* LOGIN BUTTON */}
// //           <TouchableOpacity onPress={handleLogin} disabled={loading}>
// //             <LinearGradient
// //               colors={['#5B5BEA', '#E11D48']}
// //               style={styles.loginBtn}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator size="small" color="#fff" />
// //               ) : (
// //                 <>
// //                   <Icon name="briefcase" size={18} color="#fff" />
// //                   <Text style={styles.loginText}>Login to Dashboard</Text>
// //                 </>
// //               )}
// //             </LinearGradient>
// //           </TouchableOpacity>

// //           {/* OR CONTINUE WITH SEPARATOR */}
// //           <View style={styles.separatorContainer}>
// //             <View style={styles.separatorLine} />
// //             <Text style={styles.separatorText}>Or continue with</Text>
// //             <View style={styles.separatorLine} />
// //           </View>

// //           {/* SIGN IN WITH GOOGLE BUTTON */}
// //           <TouchableOpacity 
// //             style={styles.googleButton} 
// //             onPress={handleGoogleSignIn}
// //             disabled={googleLoading}
// //           >
// //             {googleLoading ? (
// //               <ActivityIndicator size="small" color="#4B5563" />
// //             ) : (
// //               <>
// //                 <Image 
// //                   source={require('../assets/google.png')} 
// //                   style={styles.googleIcon}
// //                 />
// //                 <Text style={styles.googleText}>Sign in with Google</Text>
// //               </>
// //             )}
// //           </TouchableOpacity>

// //           {/* PARTNER LINK */}
// //           <View style={styles.partnerRow}>
// //             <Text style={styles.partnerText}>
// //               Don't have a vendor account?
// //             </Text>
// //             <TouchableOpacity onPress={() => navigation.navigate("Register")}>
// //               <Text style={styles.partnerLink}> ✨ Become a Partner</Text>
// //             </TouchableOpacity>
// //           </View>

// //           {/* INFO BAR */}
// //           <View style={styles.infoBar}>
// //             <Icon name="briefcase" size={14} color="#6B7280" />
// //             <Text style={styles.infoText}>
// //               Vendor accounts have access to business dashboard and analytics
// //             </Text>
// //           </View>
// //         </View>
// //       </View>
// //     </ScrollView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#ffff',
// //   },
// //   scrollContent: {
// //     paddingBottom: 40,
// //   },
// //   card: {
// //     margin: 15,
// //     borderRadius: 16,
// //     backgroundColor: '#fff',
// //     overflow: 'hidden',
// //     elevation: 4,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //   },
// //   header: {
// //     padding: 25,
// //   },
// //   title: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //   },
// //   subtitle: {
// //     color: '#fff',
// //     marginTop: 5,
// //     fontSize: 14,
// //   },
// //   form: {
// //     padding: 20,
// //   },
// //   label: {
// //     fontWeight: '600',
// //     marginTop: 10,
// //     color: '#374151',
// //     fontSize: 14,
// //   },
// //   inputBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     borderRadius: 10,
// //     paddingHorizontal: 10,
// //     marginTop: 6,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   input: {
// //     flex: 1,
// //     padding: 12,
// //     fontSize: 14,
// //     color: '#1F2937',
// //   },
// //   eyeIcon: {
// //     padding: 5,
// //   },
// //   forgot: {
// //     alignSelf: 'flex-end',
// //     marginTop: 10,
// //     color: '#5B5BEA',
// //     fontSize: 13,
// //     fontWeight: '500',
// //   },
// //   loginBtn: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 16,
// //     borderRadius: 10,
// //     marginTop: 20,
// //   },
// //   loginText: {
// //     color: '#fff',
// //     fontWeight: 'bold',
// //     marginLeft: 8,
// //     fontSize: 16,
// //   },
// //   vendorcontainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F5F3FF',
// //     padding: 16,
// //     marginHorizontal: 20,
// //     marginTop: 20,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //   },
// //   iconBox: {
// //     width: 42,
// //     height: 42,
// //     borderRadius: 10,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   vendortextContainer: {
// //     flex: 1,
// //   },
// //   vendortitle: {
// //     fontSize: 16,
// //     fontWeight: '700',
// //     color: '#111827',
// //   },
// //   vendorsubtitle: {
// //     fontSize: 13,
// //     color: '#6B7280',
// //     marginTop: 2,
// //   },
// //   separatorContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginVertical: 20,
// //   },
// //   separatorLine: {
// //     flex: 1,
// //     height: 1,
// //     backgroundColor: '#E5E7EB',
// //   },
// //   separatorText: {
// //     marginHorizontal: 10,
// //     fontSize: 12,
// //     color: '#6B7280',
// //   },
// //   googleButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     borderRadius: 10,
// //     paddingVertical: 14,
// //     backgroundColor: '#FFFFFF',
// //     marginTop: 0,
// //   },
// //   googleIcon: {
// //     width: 20,
// //     height: 20,
// //     marginRight: 10,
// //   },
// //   googleText: {
// //     fontSize: 15,
// //     color: '#4B5563',
// //     fontWeight: '500',
// //   },
// //   partnerRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     marginTop: 20,
// //   },
// //   partnerText: {
// //     color: '#6B7280',
// //     fontSize: 13,
// //   },
// //   partnerLink: {
// //     color: '#7C3AED',
// //     fontWeight: '600',
// //     fontSize: 13,
// //   },
// //   infoBar: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F3F4F6',
// //     padding: 12,
// //     marginTop: 25,
// //     borderRadius: 8,
// //   },
// //   infoText: {
// //     fontSize: 12,
// //     color: '#6B7280',
// //     marginLeft: 8,
// //     flex: 1,
// //     lineHeight: 16,
// //   },
// //   errorContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF2F2',
// //     padding: 10,
// //     borderRadius: 8,
// //     marginBottom: 10,
// //     gap: 8,
// //   },
// //   errorText: {
// //     color: "#EF4444",
// //     fontSize: 13,
// //     flex: 1,
// //   },
// //   successContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F0FDF4',
// //     padding: 10,
// //     borderRadius: 8,
// //     marginBottom: 10,
// //     gap: 8,
// //   },
// //   successText: {
// //     color: "#16A34A",
// //     fontSize: 13,
// //     flex: 1,
// //   },
// // });

// // export default Login;
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from "@react-navigation/native";
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/Feather';
// import axios from 'axios';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// Icon.loadFont();

// const BASE_URL = 'https://api.aissignatureevent.com/api';

// const Login = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   // Configure Google Sign-In - YOUR CLIENT ID
//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: '184582264363-5r4gvb0baskihkg4c09crl0fccsaoon8.apps.googleusercontent.com', // Your client ID
//       scopes: ['email', 'profile'],
//       offlineAccess: true,
//       forceCodeForRefreshToken: true,
//     });
//     console.log("✅ Google Sign-In configured with your client ID");
//   }, []);

//   const handleLogin = async () => {
//     setErrorMessage("");
//     setSuccessMessage("");

//     if (!email || !password) {
//       setErrorMessage("Email and password are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post(`${BASE_URL}/vendors/login`, {
//         email,
//         password,
//       });

//       const data = response?.data ?? {};
//       console.log("Login response:", data);

//       if (data.success) {
//         await AsyncStorage.setItem("vendorToken", data.token);
//         await AsyncStorage.setItem("vendorData", JSON.stringify(data.data));
        
//         const vendorId = data.data?.vendorId || data.data?._id || data.vendorId;
//         if (vendorId) {
//           await AsyncStorage.setItem("vendorId", vendorId);
//           console.log("✅ VendorId saved:", vendorId);
//         }

//         setSuccessMessage(data.message || "Login successful");

//         setTimeout(() => {
//           navigation.replace("DashboardScreen");
//         }, 1000);
//       } else {
//         setErrorMessage(data.error?.message || "Login failed");
//       }
//     } catch (error) {
//       console.log("Login error:", error.response?.data || error.message);
//       if (error.response?.data?.error?.message) {
//         setErrorMessage(error.response.data.error.message);
//       } else {
//         setErrorMessage("Invalid email or password");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     navigation.navigate('ForgotPassword');
//   };

//   // GOOGLE SIGN-IN - SAME AS USER FILE BUT WITH VENDOR ENDPOINT
//   const handleGoogleSignIn = async () => {
//     setGoogleLoading(true);
//     setErrorMessage("");
//     setSuccessMessage("");

//     try {
//       console.log('🚀========== GOOGLE SIGN-IN STARTED ==========');
      
//       // Step 1: Check Google Play Services
//       console.log('📱 Step 1: Checking Google Play Services...');
//       await GoogleSignin.hasPlayServices();
//       console.log('✅ Google Play Services are available');
      
//       // Step 2: Clear any existing account to force account picker
//       console.log('🔄 Step 2: Clearing previous sign-in state...');
//       try {
//         const currentUser = await GoogleSignin.getCurrentUser();
//         if (currentUser) {
//           console.log('👤 Current user exists, signing out first...');
//           await GoogleSignin.signOut();
//           console.log('✅ Previous user signed out');
//         }
//       } catch (signOutError) {
//         console.log('⚠️ Error during sign out:', signOutError.message);
//       }
      
//       // Step 3: Sign in with Google
//       console.log('🔐 Step 3: Initiating Google Sign-In...');
//       await GoogleSignin.signIn();
//       console.log('✅ Google Sign-In successful!');
      
//       // Step 4: Get tokens (JUST LIKE USER FILE)
//       console.log('🔑 Step 4: Getting authentication tokens...');
//       const tokens = await GoogleSignin.getTokens();
//       console.log('✅ Tokens received successfully');
//       console.log('   - Access Token present:', !!tokens.accessToken);
      
//       // Step 5: Send accessToken to backend (JUST LIKE USER FILE)
//       console.log('📦 Step 5: Preparing request for backend...');
//       const requestBody = {
//         accessToken: tokens.accessToken  // ← IMPORTANT: accessToken bhejo
//       };
      
//       console.log('🌐 Step 6: Calling backend API...');
//       console.log('📍 API URL:', `${BASE_URL}/vendors/google-login`);
//       console.log('📤 Request body:', { accessToken: tokens.accessToken.substring(0, 30) + '...' });
      
//       const response = await axios.post(`${BASE_URL}/vendors/google-login`, requestBody);
      
//       console.log('📥 Backend Response Status:', response.status);
//       console.log('📄 Backend Response Data:', JSON.stringify(response.data, null, 2));
      
//       // Step 6: Handle response (JUST LIKE USER FILE)
//       if (response.status === 200 && (response.data.success || response.data.token)) {
//         console.log('🎉========== GOOGLE SIGN-IN SUCCESSFUL ==========');
        
//         // Store token
//         const token = response.data.token;
//         if (token) {
//           await AsyncStorage.setItem("vendorToken", token);
//           console.log('✅ Token stored successfully');
//         }
        
//         // Store vendor data
//         const vendorData = response.data.data;
//         if (vendorData) {
//           await AsyncStorage.setItem("vendorData", JSON.stringify(vendorData));
//           console.log('✅ Vendor data stored successfully');
          
//           const vendorId = vendorData.vendorId || vendorData._id;
//           if (vendorId) {
//             await AsyncStorage.setItem("vendorId", vendorId);
//             console.log('✅ VendorId saved:', vendorId);
//           }
          
//           if (vendorData.businessName) {
//             await AsyncStorage.setItem("vendorBusinessName", vendorData.businessName);
//             console.log('✅ Business name saved:', vendorData.businessName);
//           }
//         }
        
//         setSuccessMessage(response.data.message || "Google login successful");
        
//         setTimeout(() => {
//           navigation.replace("DashboardScreen");
//         }, 1000);
        
//       } else if (response.status === 401 && response.data?.error?.code === 'VENDOR_NOT_FOUND') {
//         console.log('⚠️ Vendor not found');
//         setErrorMessage("No vendor account found with this email. Please register first.");
//       } else if (response.status === 403 && response.data?.error?.code === 'ACCOUNT_PENDING_APPROVAL') {
//         console.log('⚠️ Account pending approval');
//         setErrorMessage("Your account is pending admin approval. Please wait for activation.");
//       } else {
//         console.log('❌ Google sign-in failed');
//         setErrorMessage(response.data?.error?.message || "Google login failed");
//       }
      
//     } catch (error) {
//       console.log('💥========== GOOGLE SIGN-IN EXCEPTION ==========');
//       console.log('💥 Error code:', error.code);
//       console.log('💥 Error message:', error.message);
      
//       if (error.response) {
//         console.log('📡 Error response status:', error.response.status);
//         console.log('📡 Error response data:', error.response.data);
        
//         if (error.response.status === 401 && error.response.data?.error?.code === 'VENDOR_NOT_FOUND') {
//           setErrorMessage("No vendor account found with this email. Please register first.");
//         } else if (error.response.status === 403 && error.response.data?.error?.code === 'ACCOUNT_PENDING_APPROVAL') {
//           setErrorMessage("Your account is pending admin approval. Please wait for activation.");
//         } else {
//           setErrorMessage(error.response.data?.error?.message || "Google login failed");
//         }
//       } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         console.log('🚫 User cancelled sign-in');
//         // No error message for cancellation
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         console.log('⏳ Sign-in already in progress');
//         setErrorMessage("Sign-in is already in progress");
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         console.log('📱 Play Services not available');
//         setErrorMessage("Google Play Services is not available on this device");
//       } else {
//         setErrorMessage(error.message || "An error occurred during Google sign-in");
//       }
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       showsVerticalScrollIndicator={true}
//       contentContainerStyle={styles.scrollContent}
//     >
//       <View style={styles.card}>
//         {/* HEADER */}
//         <LinearGradient
//           colors={['#5B5BEA', '#8A3BD1', '#E11D48']}
//           style={styles.header}
//         >
//           <Text style={styles.title}>Vendor Portal</Text>
//           <Text style={styles.subtitle}>Sign in to manage your business</Text>
//         </LinearGradient>

//         {/* VENDOR ACCESS BANNER */}
//         <View style={styles.vendorcontainer}>
//           <LinearGradient
//             colors={['#7C3AED', '#EC4899']}
//             style={styles.iconBox}
//           >
//             <Icon name="briefcase" size={18} color="#fff" />
//           </LinearGradient>

//           <View style={styles.vendortextContainer}>
//             <Text style={styles.vendortitle}>Vendor Access</Text>
//             <Text style={styles.vendorsubtitle}>
//               Manage your business dashboard
//             </Text>
//           </View>
//         </View>

//         <View style={styles.form}>
//           {/* ERROR MESSAGE */}
//           {errorMessage ? (
//             <View style={styles.errorContainer}>
//               <Icon name="alert-circle" size={16} color="#EF4444" />
//               <Text style={styles.errorText}>{errorMessage}</Text>
//             </View>
//           ) : null}

//           {/* SUCCESS MESSAGE */}
//           {successMessage ? (
//             <View style={styles.successContainer}>
//               <Icon name="check-circle" size={16} color="#16A34A" />
//               <Text style={styles.successText}>{successMessage}</Text>
//             </View>
//           ) : null}

//           {/* EMAIL */}
//           <Text style={styles.label}>Email Address *</Text>
//           <View style={styles.inputBox}>
//             <Icon name="mail" size={18} color="#8E8E98" />
//             <TextInput
//               placeholder="your@email.com"
//               style={styles.input}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               value={email}
//               onChangeText={setEmail}
//             />
//           </View>

//           {/* PASSWORD */}
//           <Text style={styles.label}>Password *</Text>
//           <View style={styles.inputBox}>
//             <Icon name="lock" size={18} color="#8E8E98" />
//             <TextInput
//               placeholder="Enter your password"
//               secureTextEntry={!showPassword}
//               style={styles.input}
//               value={password}
//               onChangeText={setPassword}
//             />
//             <TouchableOpacity
//               onPress={() => setShowPassword(prev => !prev)}
//               activeOpacity={0.7}
//               style={styles.eyeIcon}
//             >
//               <Icon
//                 name={showPassword ? "eye-off" : "eye"}
//                 size={18}
//                 color="#8E8E98"
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity onPress={handleForgotPassword}>
//             <Text style={styles.forgot}>Forgot Password?</Text>
//           </TouchableOpacity>

//           {/* LOGIN BUTTON */}
//           <TouchableOpacity onPress={handleLogin} disabled={loading}>
//             <LinearGradient
//               colors={['#5B5BEA', '#E11D48']}
//               style={styles.loginBtn}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <Icon name="briefcase" size={18} color="#fff" />
//                   <Text style={styles.loginText}>Login to Dashboard</Text>
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* OR CONTINUE WITH SEPARATOR */}
//           <View style={styles.separatorContainer}>
//             <View style={styles.separatorLine} />
//             <Text style={styles.separatorText}>Or continue with</Text>
//             <View style={styles.separatorLine} />
//           </View>

//           {/* SIGN IN WITH GOOGLE BUTTON */}
//           <TouchableOpacity 
//             style={styles.googleButton} 
//             onPress={handleGoogleSignIn}
//             disabled={googleLoading}
//           >
//             {googleLoading ? (
//               <ActivityIndicator size="small" color="#4B5563" />
//             ) : (
//               <>
//                 <Image 
//                   source={require('../assets/google.png')} 
//                   style={styles.googleIcon}
//                 />
//                 <Text style={styles.googleText}>Sign in with Google</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {/* PARTNER LINK */}
//           <View style={styles.partnerRow}>
//             <Text style={styles.partnerText}>
//               Don't have a vendor account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate("Register")}>
//               <Text style={styles.partnerLink}> ✨ Become a Partner</Text>
//             </TouchableOpacity>
//           </View>

//           {/* INFO BAR */}
//           <View style={styles.infoBar}>
//             <Icon name="briefcase" size={14} color="#6B7280" />
//             <Text style={styles.infoText}>
//               Vendor accounts have access to business dashboard and analytics
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffff',
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   card: {
//     margin: 15,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     overflow: 'hidden',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   header: {
//     padding: 25,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   subtitle: {
//     color: '#fff',
//     marginTop: 5,
//     fontSize: 14,
//   },
//   form: {
//     padding: 20,
//   },
//   label: {
//     fontWeight: '600',
//     marginTop: 10,
//     color: '#374151',
//     fontSize: 14,
//   },
//   inputBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     marginTop: 6,
//     backgroundColor: '#F9FAFB',
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//     fontSize: 14,
//     color: '#1F2937',
//   },
//   eyeIcon: {
//     padding: 5,
//   },
//   forgot: {
//     alignSelf: 'flex-end',
//     marginTop: 10,
//     color: '#5B5BEA',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   loginBtn: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   loginText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     marginLeft: 8,
//     fontSize: 16,
//   },
//   vendorcontainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F3FF',
//     padding: 16,
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   iconBox: {
//     width: 42,
//     height: 42,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   vendortextContainer: {
//     flex: 1,
//   },
//   vendortitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   vendorsubtitle: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   separatorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   separatorLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#E5E7EB',
//   },
//   separatorText: {
//     marginHorizontal: 10,
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   googleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 10,
//     paddingVertical: 14,
//     backgroundColor: '#FFFFFF',
//     marginTop: 0,
//   },
//   googleIcon: {
//     width: 20,
//     height: 20,
//     marginRight: 10,
//   },
//   googleText: {
//     fontSize: 15,
//     color: '#4B5563',
//     fontWeight: '500',
//   },
//   partnerRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   partnerText: {
//     color: '#6B7280',
//     fontSize: 13,
//   },
//   partnerLink: {
//     color: '#7C3AED',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   infoBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     padding: 12,
//     marginTop: 25,
//     borderRadius: 8,
//   },
//   infoText: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginLeft: 8,
//     flex: 1,
//     lineHeight: 16,
//   },
//   errorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     gap: 8,
//   },
//   errorText: {
//     color: "#EF4444",
//     fontSize: 13,
//     flex: 1,
//   },
//   successContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0FDF4',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     gap: 8,
//   },
//   successText: {
//     color: "#16A34A",
//     fontSize: 13,
//     flex: 1,
//   },
// });

// export default Login;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";

Icon.loadFont();

const BASE_URL = 'https://api.aissignatureevent.com/api';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New state for auto-login check

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '184582264363-5r4gvb0baskihkg4c09crl0fccsaoon8.apps.googleusercontent.com',
      scopes: ['email', 'profile'],
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    console.log("✅ Google Sign-In configured with your client ID");
    
    // Check if user is already logged in
    checkAutoLogin();
  }, []);

  // Auto-login function
  const checkAutoLogin = async () => {
    try {
      console.log("🔍 Checking for existing session...");
      const vendorToken = await AsyncStorage.getItem("vendorToken");
      const vendorData = await AsyncStorage.getItem("vendorData");
      
      console.log("vendorToken exists:", !!vendorToken);
      console.log("vendorData exists:", !!vendorData);
      
      if (vendorToken && vendorData) {
        console.log("✅ Existing session found! Auto-logging in...");
        
        // Optional: Verify token with backend (can add if needed)
        // const isValid = await verifyTokenWithBackend(vendorToken);
        // if (isValid) {
          setTimeout(() => {
            navigation.replace("DashboardScreen");
          }, 500);
        // }
      } else {
        console.log("❌ No existing session found");
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.log("Error checking auto-login:", error);
      setIsCheckingAuth(false);
    }
  };

  // Optional: Verify token with backend (recommended for security)
  const verifyTokenWithBackend = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/vendors/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data?.valid === true;
    } catch (error) {
      console.log("Token verification failed:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}/vendors/login`, {
        email,
        password,
      });

      const data = response?.data ?? {};
      console.log("Login response:", data);

      if (data.success) {
        // Store all necessary data for auto-login
        await AsyncStorage.setItem("vendorToken", data.token);
        await AsyncStorage.setItem("vendorData", JSON.stringify(data.data));
        await AsyncStorage.setItem("isLoggedIn", "true"); // Add login flag
        
        const vendorId = data.data?.vendorId || data.data?._id || data.vendorId;
        if (vendorId) {
          await AsyncStorage.setItem("vendorId", vendorId);
          console.log("✅ VendorId saved:", vendorId);
        }

        // Store email for remember me feature (optional)
        await AsyncStorage.setItem("lastLoggedInEmail", email);

        setSuccessMessage(data.message || "Login successful");

        setTimeout(() => {
          navigation.replace("DashboardScreen");
        }, 1000);
      } else {
        setErrorMessage(data.error?.message || "Login failed");
      }
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      if (error.response?.data?.error?.message) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      console.log('🚀========== GOOGLE SIGN-IN STARTED ==========');
      
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services are available');
      
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          console.log('👤 Current user exists, signing out first...');
          await GoogleSignin.signOut();
          console.log('✅ Previous user signed out');
        }
      } catch (signOutError) {
        console.log('⚠️ Error during sign out:', signOutError.message);
      }
      
      console.log('🔐 Step 3: Initiating Google Sign-In...');
      await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful!');
      
      console.log('🔑 Step 4: Getting authentication tokens...');
      const tokens = await GoogleSignin.getTokens();
      console.log('✅ Tokens received successfully');
      
      const requestBody = {
        accessToken: tokens.accessToken
      };
      
      console.log('🌐 Step 6: Calling backend API...');
      const response = await axios.post(`${BASE_URL}/vendors/google-login`, requestBody);
      
      console.log('📥 Backend Response:', response.status);
      
      if (response.status === 200 && (response.data.success || response.data.token)) {
        console.log('🎉 GOOGLE SIGN-IN SUCCESSFUL');
        
        const token = response.data.token;
        if (token) {
          await AsyncStorage.setItem("vendorToken", token);
          await AsyncStorage.setItem("isLoggedIn", "true"); // Add login flag
          console.log('✅ Token stored successfully');
        }
        
        const vendorData = response.data.data;
        if (vendorData) {
          await AsyncStorage.setItem("vendorData", JSON.stringify(vendorData));
          console.log('✅ Vendor data stored successfully');
          
          const vendorId = vendorData.vendorId || vendorData._id;
          if (vendorId) {
            await AsyncStorage.setItem("vendorId", vendorId);
            console.log('✅ VendorId saved:', vendorId);
          }
          
          if (vendorData.businessName) {
            await AsyncStorage.setItem("vendorBusinessName", vendorData.businessName);
            console.log('✅ Business name saved:', vendorData.businessName);
          }
          
          if (vendorData.email) {
            await AsyncStorage.setItem("lastLoggedInEmail", vendorData.email);
            console.log('✅ Email saved:', vendorData.email);
          }
        }
        
        setSuccessMessage(response.data.message || "Google login successful");
        
        setTimeout(() => {
          navigation.replace("DashboardScreen");
        }, 1000);
        
      } else if (response.status === 401 && response.data?.error?.code === 'VENDOR_NOT_FOUND') {
        console.log('⚠️ Vendor not found');
        setErrorMessage("No vendor account found with this email. Please register first.");
      } else if (response.status === 403 && response.data?.error?.code === 'ACCOUNT_PENDING_APPROVAL') {
        console.log('⚠️ Account pending approval');
        setErrorMessage("Your account is pending admin approval. Please wait for activation.");
      } else {
        console.log('❌ Google sign-in failed');
        setErrorMessage(response.data?.error?.message || "Google login failed");
      }
      
    } catch (error) {
      console.log('💥 GOOGLE SIGN-IN EXCEPTION:', error.message);
      
      if (error.response) {
        if (error.response.status === 401 && error.response.data?.error?.code === 'VENDOR_NOT_FOUND') {
          setErrorMessage("No vendor account found with this email. Please register first.");
        } else if (error.response.status === 403 && error.response.data?.error?.code === 'ACCOUNT_PENDING_APPROVAL') {
          setErrorMessage("Your account is pending admin approval. Please wait for activation.");
        } else {
          setErrorMessage(error.response.data?.error?.message || "Google login failed");
        }
      } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('🚫 User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setErrorMessage("Sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage("Google Play Services is not available on this device");
      } else {
        setErrorMessage(error.message || "An error occurred during Google sign-in");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show loading indicator while checking auto-login
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B5BEA" />
        <Text style={styles.loadingText}>Checking existing session...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        {/* HEADER */}
        <LinearGradient
          colors={['#5B5BEA', '#8A3BD1', '#E11D48']}
          style={styles.header}
        >
          <Text style={styles.title}>Vendor Portal</Text>
          <Text style={styles.subtitle}>Sign in to manage your business</Text>
        </LinearGradient>

        {/* VENDOR ACCESS BANNER */}
        <View style={styles.vendorcontainer}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            style={styles.iconBox}
          >
            <Icon name="briefcase" size={18} color="#fff" />
          </LinearGradient>

          <View style={styles.vendortextContainer}>
            <Text style={styles.vendortitle}>Vendor Access</Text>
            <Text style={styles.vendorsubtitle}>
              Manage your business dashboard
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* ERROR MESSAGE */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* SUCCESS MESSAGE */}
          {successMessage ? (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={16} color="#16A34A" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* EMAIL */}
          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputBox}>
            <Icon name="mail" size={18} color="#8E8E98" />
            <TextInput
              placeholder="your@email.com"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputBox}>
            <Icon name="lock" size={18} color="#8E8E98" />
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              activeOpacity={0.7}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#8E8E98"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={['#5B5BEA', '#E11D48']}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="briefcase" size={18} color="#fff" />
                  <Text style={styles.loginText}>Login to Dashboard</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* OR CONTINUE WITH SEPARATOR */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Or continue with</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* SIGN IN WITH GOOGLE BUTTON */}
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#4B5563" />
            ) : (
              <>
                <Image 
                  source={require('../assets/google.png')} 
                  style={styles.googleIcon}
                />
                <Text style={styles.googleText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* PARTNER LINK */}
          <View style={styles.partnerRow}>
            <Text style={styles.partnerText}>
              Don't have a vendor account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.partnerLink}> ✨ Become a Partner</Text>
            </TouchableOpacity>
          </View>

          {/* INFO BAR */}
          <View style={styles.infoBar}>
            <Icon name="briefcase" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              Vendor accounts have access to business dashboard and analytics
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    margin: 15,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
    color: '#374151',
    fontSize: 14,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 6,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 5,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 10,
    color: '#5B5BEA',
    fontSize: 13,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  vendorcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vendortextContainer: {
    flex: 1,
  },
  vendortitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  vendorsubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#6B7280',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  partnerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  partnerText: {
    color: '#6B7280',
    fontSize: 13,
  },
  partnerLink: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 13,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    marginTop: 25,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  successText: {
    color: "#16A34A",
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Login;