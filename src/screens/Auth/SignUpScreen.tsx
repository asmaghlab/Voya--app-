import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { registerUser } from "../../features/auth/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import bcrypt from "bcryptjs";
import {
  RegisterFormData,
  registerSchema,
} from "../../utils/schema/signupSchema";
import { registerStyles } from "../../styles/registerStyle";
import { RootState } from "../../routes/store";
import Toast from "react-native-toast-message";

// Fallback random bytes for Expo
bcrypt.setRandomFallback((len) => {
  const result = [];
  for (let i = 0; i < len; i++) {
    result.push(Math.floor(Math.random() * 256));
  }
  return result;
});

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector(
    (state: RootState) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      Toast.show({
        type: "success",
        text1: "Login Successfully",
        position: "top",
        visibilityTime: 2000,
        topOffset: 50,
      });
      navigation.navigate("Home");
    }
  }, [user, navigation]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      country: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    dispatch(
      registerUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        country: data.country,
      })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={registerStyles.container}>
        {/* Header */}
        {/* <View style={registerStyles.topSection}>
          <ImageBackground
            source={require("../../assets/plane.png")}
            style={registerStyles.backgroundImage}
          >
            <Text style={registerStyles.title}>Register</Text>
          </ImageBackground>
        </View> */}
        <View style={registerStyles.imageContainer}>
          <Image
            source={require("../../../assets/plane.png")}
            style={registerStyles.headerImage}
            resizeMode="contain"
          />
        </View>
        <View style={registerStyles.welcomeSection}>
                    <Text style={registerStyles.welcomeText}>Welcome</Text>
                    <Text style={registerStyles.subtitleText}>Register with E-mail</Text>
                  </View>
        {/* Form */}
        <View style={registerStyles.form}>
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.name && (
                  <Text style={registerStyles.error}>
                    {errors.name.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.email && (
                  <Text style={registerStyles.error}>
                    {errors.email.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <>
                <View style={registerStyles.inputContainer}>
                  <TextInput
                    style={registerStyles.inputpass}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={24}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={registerStyles.error}>
                    {errors.password.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <>
                <View style={registerStyles.inputContainer}>
                  <TextInput
                    style={registerStyles.inputpass}
                    placeholder="Confirm Password"
                    secureTextEntry={!showConfirmPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye" : "eye-off"}
                      size={24}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={registerStyles.error}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Phone */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Phone"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.phone && (
                  <Text style={registerStyles.error}>
                    {errors.phone.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Country */}
          <Controller
            control={control}
            name="country"
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Country"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.country && (
                  <Text style={registerStyles.error}>
                    {errors.country.message}
                  </Text>
                )}
              </>
            )}
          />

          {error && <Text style={registerStyles.error}>{error}</Text>}

          <TouchableOpacity
            style={registerStyles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={registerStyles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <Text style={registerStyles.footerText}>
            Already have an account?{" "}
            <Text
              style={registerStyles.loginText}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

