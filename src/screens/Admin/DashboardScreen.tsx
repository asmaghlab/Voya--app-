import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { ProtectedRoute } from "../../navigation/ProtectedRoute";
import { useAppDispatch } from "../../routes/hooks";
import { logout } from "../../features/auth/authSlice";
import { resetTo } from "../../navigation/RootNavigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Plane,
  Hotel,
  Users,
  Mail,
  BarChart3,
  LogOut,
} from "lucide-react-native";

type DashboardStackParamList = {
  ManageFlights: undefined;
  ManageHotels: undefined;
  ManageUsers: undefined;
  Reports: undefined;
  AdminMessages: undefined;
  Dashboard: undefined;
};

type DashboardNavigationProp =
  NativeStackNavigationProp<DashboardStackParamList>;

const AnimatedCard = ({
  children,
  onPress,
  delay = 0,
}: {
  children: React.ReactNode;
  onPress: () => void;
  delay?: number;
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DashboardNavigationProp>();

  const handleLogout = () => {
    dispatch(logout());
    resetTo("Login");
  };

  return (
    <ProtectedRoute adminOnly>
      <View style={styles.container}>
        {/* AppBar */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>Admin Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Admin 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Control everything from one place
            </Text>
          </View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            <AnimatedCard
              delay={100}
              onPress={() => navigation.navigate("ManageFlights")}
            >
              <View style={styles.card}>
                <Plane size={32} color="#0ea5e9" />
                <Text style={styles.cardTitle}>Flights</Text>
                <Text style={styles.cardDesc}>Manage flight data</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              delay={200}
              onPress={() => navigation.navigate("ManageHotels")}
            >
              <View style={styles.card}>
                <Hotel size={32} color="#22c55e" />
                <Text style={styles.cardTitle}>Hotels</Text>
                <Text style={styles.cardDesc}>Hotel listings</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              delay={300}
              onPress={() => navigation.navigate("ManageUsers")}
            >
              <View style={styles.card}>
                <Users size={32} color="#f59e0b" />
                <Text style={styles.cardTitle}>Users</Text>
                <Text style={styles.cardDesc}>User management</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              delay={400}
              onPress={() => navigation.navigate("AdminMessages")}
            >
              <View style={styles.card}>
                <Mail size={32} color="#ef4444" />
                <Text style={styles.cardTitle}>Messages</Text>
                <Text style={styles.cardDesc}>Customer inquiries</Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              delay={500}
              onPress={() => navigation.navigate("Reports")}
            >
              <View style={styles.cardFull}>
                <BarChart3 size={32} color="#6366f1" />
                <Text style={styles.cardTitle}>Reports</Text>
                <Text style={styles.cardDesc}>Analytics & statistics</Text>
              </View>
            </AnimatedCard>
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },

  appBar: {
    backgroundColor: "#0ea5e9",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appBarTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },

  content: { padding: 20 },

  welcomeSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  welcomeSubtitle: {
    color: "#64748b",
    marginTop: 5,
  },

  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#fff",
    width: 160,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },
  cardFull: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  cardTitle: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 16,
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
});
