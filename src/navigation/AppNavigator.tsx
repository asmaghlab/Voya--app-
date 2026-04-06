import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home,
  Plane,
  Building,
  User,
  Heart,
  Phone,
  MapPin,
} from "lucide-react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../routes/store";
import { navigationRef } from "./RootNavigation";
import { RootStackParamList } from "./types";
import { loadAuthFromStorage } from "../features/auth/authSlice";

// Screens
import WelcomeScreen from "../screens/welcom/welcomScreen";
import OnboardingScreen from "../screens/welcom/onboardingScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/Admin/DashboardScreen";
import { ForgotPasswordScreen } from "../screens/Auth/ForgotPasswordScreen";
import { VerifyCodeScreen } from "../screens/Auth/VerifyCodeScreen";
import { ResetPasswordScreen } from "../screens/Auth/ResetPasswordScreen";
import HotelsScreen from "../screens/Hotels/HotelsScreen";
import FlightsScreen from "../screens/Flights/FlightsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import FlightDetailsScreen from "../screens/Flights/FlightDetailsScreen";
import HotelDetailsScreen from "../screens/Hotels/HotelDetailsScreen";
import AIDiscoveryScreen from "../screens/Chat/Chat";
import WishlistScreen from "../screens/Wishlist/WishlistScreen";
import ReportsScreen from "../screens/Admin/ReportsScreen";
import ManageFlightsScreen from "../screens/Admin/ManageFlightsScreen";
import ManageHotelsScreen from "../screens/Admin/ManageHotelsScreen";
import ManageUsersScreen from "../screens/Admin/ManageUsersScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import CountriesScreen from "../screens/Countries/CountriesScreen";
import CountryDetailsScreen from "../screens/Countries/CountryDetailsScreen";
import SearchScreen from "../screens/SearchScreen";
import HotelWrapper from "../screens/Hotels/HotelWrapper";
import AdminMessagesScreen from "../screens/Admin/AdminMessages";
import CustomTabBar from "../layouts/MainLayout/AppBar";

/* ================= Navigators ================= */

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const CountriesStack = createNativeStackNavigator();
const FlightsStack = createNativeStackNavigator();
const HotelsStack = createNativeStackNavigator();

/* ================= Stacks ================= */

function CountriesStackScreen() {
  return (
    <CountriesStack.Navigator screenOptions={{ headerShown: false }}>
      <CountriesStack.Screen name="CountriesList" component={CountriesScreen} />
      <CountriesStack.Screen
        name="CountryDetails"
        component={CountryDetailsScreen}
      />
    </CountriesStack.Navigator>
  );
}

function FlightsStackScreen() {
  return (
    <FlightsStack.Navigator screenOptions={{ headerShown: false }}>
      <FlightsStack.Screen name="FlightsList" component={FlightsScreen} />
      <FlightsStack.Screen name="FlightDetails" component={FlightDetailsScreen} />
    </FlightsStack.Navigator>
  );
}

function HotelsStackScreen() {
  return (
    <HotelsStack.Navigator screenOptions={{ headerShown: false }}>
      <HotelsStack.Screen name="HotelsList" component={HotelWrapper} />
      <HotelsStack.Screen name="HotelDetails" component={HotelDetailsScreen} />
    </HotelsStack.Navigator>
  );
}

/* ================= App Navigator ================= */

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );
  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, [dispatch]);

  /* ================= USER TABS ================= */

  if (token && user && user.role === "user") {
    return (
      <NavigationContainer ref={navigationRef}>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Countries"
            component={CountriesStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MapPin color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Flights"
            component={FlightsStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Plane color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Hotels"
            component={HotelsStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Building color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="ContactUs"
            component={ContactUsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Phone color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{
              tabBarButton: () => null,
              tabBarBadge:
                wishlistItems.length > 0 ? wishlistItems.length : undefined,
                tabBarIcon: ({ color, size }) => (
                <Heart color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{ tabBarButton: () => null }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  /* ================= STACK (ADMIN / GUEST) ================= */

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="ManageFlights" component={ManageFlightsScreen} />
            <Stack.Screen name="ManageHotels" component={ManageHotelsScreen} />
            <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
            <Stack.Screen name="AdminMessages" component={AdminMessagesScreen} />
          </>
        )}

        {/* Shared */}
        <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} />
        <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
        <Stack.Screen name="AIDiscovery" component={AIDiscoveryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
