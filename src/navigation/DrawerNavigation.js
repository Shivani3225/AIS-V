// import React, { useState } from "react";
// import { createDrawerNavigator } from "@react-navigation/drawer";
// import BottomTabs from "../navigation/Bottomtab";
// import OverView from "../screens/Profile/OverView";
// import PortFolioGallery from "../screens/Profile/PortFolioGallery";
// import VideoContent from "../screens/Profile/VideoContent";
// import BlogPost from "../screens/Profile/BlogPost";
// import Reviews from "../screens/Profile/Reviews";
// import Logout from "../components/Logout";
// import Icon from "react-native-vector-icons/Ionicons";

// const Drawer = createDrawerNavigator();

// const DrawerNavigation = () => {

//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   return (
//     <>
//       <Drawer.Navigator
//         screenOptions={{
//           headerShown: false,
//           drawerPosition: "right",
//           drawerActiveTintColor: "#2929e6",
//           drawerInactiveTintColor: "#8E8E93",
//         }}
//       >

//         <Drawer.Screen
//           name="HomeTabs"
//           component={BottomTabs}
//           options={{
//             title: "Profile",
//             drawerIcon: ({ color, size }) => (
//               <Icon name="person-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         <Drawer.Screen
//           name="Overview"
//           component={OverView}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Icon name="grid-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         <Drawer.Screen
//           name="Portfolio Gallery"
//           component={PortFolioGallery}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Icon name="images-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         <Drawer.Screen
//           name="Video Content"
//           component={VideoContent}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Icon name="videocam-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         <Drawer.Screen
//           name="Blog Post"
//           component={BlogPost}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Icon name="create-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         <Drawer.Screen
//           name="Reviews"
//           component={Reviews}
//           options={{
//             drawerIcon: ({ color, size }) => (
//               <Icon name="star-outline" size={size} color={color} />
//             ),
//           }}
//         />

//         {/* Logout */}
//         <Drawer.Screen
//           name="Logout"
//           component={BottomTabs}
//           options={{
//             drawerLabelStyle: {
//               color: "#ee2e2e",
//               fontWeight: "600",
//             },
//             drawerIcon: ({ size }) => (
//               <Icon name="log-out-outline" size={size} color="#ee2e2e" />
//             ),
//           }}
//           listeners={{
//             drawerItemPress: (e) => {
//               e.preventDefault();
//               setShowLogoutModal(true);
//             },
//           }}
//         />

//       </Drawer.Navigator>

//       {/* Logout Modal */}
//       <Logout
//         visible={showLogoutModal}
//         onClose={() => setShowLogoutModal(false)}
//       />

//     </>
//   );
// };

// export default DrawerNavigation;