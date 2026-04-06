import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { loginUser, clearError } from "../../features/auth/authSlice";

import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import type { RootState } from "../../routes/store";

type RootStackParamList = {
  Register: undefined;
  ForgotPassword: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();

  const { user, isLoading, error } = useAppSelector(
    (state: RootState) => state.auth
  );

  /* ✅ لما اليوزر يوصل → AppNavigator هيتكفل بالباقي */
  useEffect(() => {
    if (user) {
      Toast.show({
        type: "success",
        text1: "Login Successfully",
        position: "top",
        visibilityTime: 2000,
        topOffset: 50,
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error,
        position: "top",
        visibilityTime: 3000,
        topOffset: 50,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = () => {
    let valid = true;

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    dispatch(loginUser({ email, password }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/plane.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subtitleText}>Login with E-mail</Text>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailError("")}
              />
            </View>
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordError("")}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 40 },
  imageContainer: { position: "absolute", top: 10, right: 10 },
  headerImage: { width: 120, height: 60 },
  welcomeSection: { alignItems: "center", marginTop: 80, marginBottom: 40 },
  welcomeText: { fontSize: 48, fontWeight: "800", color: "#00A6E8" },
  subtitleText: { fontSize: 15, color: "#666" },
  form: { paddingHorizontal: 30 },
  inputWrapper: { marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  input: { flex: 1, marginLeft: 10 },
  forgotPasswordContainer: { alignItems: "flex-end", marginBottom: 30 },
  forgotPasswordText: { fontSize: 12, color: "#00A6E8" },
  loginButton: {
    backgroundColor: "#00A6E8",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerContainer: { flexDirection: "row", justifyContent: "center" },
  registerText: { color: "#666" },
  registerLink: { color: "#00A6E8", fontWeight: "700" },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },
});
