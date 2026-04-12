import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

// Screens
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import Inquiries from "../screens/Inquiries/Inquiries";
import MyProfile from "../screens/Profile/MyProfile";
import MyPlan from "../screens/Profile/MyPlan";
import Payment from "../screens/Payment/Payment";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2F6FED",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = "grid-outline";
          } else if (route.name === "Inquiries") {
            iconName = "mail-outline";
          } else if (route.name === "MyPlan") {
            iconName = "ribbon-outline";
          } else if (route.name === "Payment") {
            iconName = "card-outline";
          } else if (route.name === "MyProfile") {
            iconName = "person-outline";
          }

          return <Icon name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inquiries" component={Inquiries} />
      <Tab.Screen name="MyPlan" component={MyPlan} />
      <Tab.Screen name="Payment" component={Payment} />
      <Tab.Screen name="MyProfile" component={MyProfile} />
    </Tab.Navigator>
  );
};

export default BottomTabs;