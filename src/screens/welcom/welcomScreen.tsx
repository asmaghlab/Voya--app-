import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../navigation/types";

type WelcomeScreenProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenProp>();

  const handleNext = async (screen: keyof RootStackParamList) => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    navigation.replace(screen as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleNext("Login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleNext("Register")}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleNext("Onboarding")}>
        <Text style={styles.buttonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 40, color: "#333" },
  button: {
    width: "80%",
    paddingVertical: 15,
    backgroundColor: "#00A6E8",
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});

export default WelcomeScreen;
