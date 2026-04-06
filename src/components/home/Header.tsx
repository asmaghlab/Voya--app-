import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Search } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { logout } from "../../features/auth/authSlice";

export const Header = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo */}
        <Pressable onPress={() => navigation.navigate("Home")}>
          <Text style={styles.logo}>
            <Text style={styles.logoPrimary}>Vo</Text>
            <Text style={styles.logoSecondary}>Ya</Text>
          </Text>
        </Pressable>

        {/* Search */}
        {user && (
          <Pressable onPress={() => navigation.navigate("Search")}>
            <Search size={24} color="#0ea5e9" />
          </Pressable>
        )}

        {/* Login / Logout */}
        {user ? (
          <Pressable onPress={() => dispatch(logout())}>
            <Text style={styles.logout}>Logout</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.login}>Login</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  logoPrimary: {
    color: "#000", // Vo
  },
  logoSecondary: {
    color: "#0ea5e9", // Ya
  },
  login: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
  logout: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
});
