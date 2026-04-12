import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../Auth/SplashScreen";
import Login from "../Auth/Login";
import ForgotPassword from "../Auth/ForgotPassword";
import Register from "../Auth/Register";
import DrawerNavigation from "./DrawerNavigation";
import Bottomtab from "./Bottomtab";
import ChangePlan from "../screens/Profile/ChangePlan";
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
        />

        <Stack.Screen 
          name="Login" 
          component={Login} 
        />
        
         <Stack.Screen name="ForgotPassword"
         component={ForgotPassword} />
        <Stack.Screen 
          name="Register" 
          component={Register} 
        /> 

        {/* Main App After Login */}
        { <Stack.Screen 
          name="DashboardScreen" 
          component={Bottomtab} 
        /> }
        
        { <Stack.Screen 
          name="ChangePlan" 
          component={ChangePlan} 
        /> }
      </Stack.Navigator>
    
  );
};

export default AppNavigator;