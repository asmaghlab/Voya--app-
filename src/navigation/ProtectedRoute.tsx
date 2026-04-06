import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../routes/store";
import { useNavigation } from "@react-navigation/native";
import { logout } from "../features/auth/authSlice";

type Props = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export const ProtectedRoute: React.FC<Props> = ({ children, adminOnly = false }) => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login"); // يرجع للصفحة الرئيسية
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Access Denied. Please login first.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Login")}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Access Denied. Admin only.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
        {/* زرار Logout */}
        <TouchableOpacity style={[styles.button, { marginTop: 15, backgroundColor: "#FF4D4D" }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 18, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  button: { padding: 12, backgroundColor: "#00A6E8", borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
