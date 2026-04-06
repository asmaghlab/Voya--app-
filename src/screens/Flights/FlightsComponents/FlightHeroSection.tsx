// FlightHeroSection.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const FlightHeroSection = () => {
  return (
    <LinearGradient
      colors={["#f9fafb", "#f3f4f6", "#f9fafb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <View style={styles.content}>
        <Text style={styles.title}>Discover Destinations</Text>
        <Text style={styles.description}>
          Find the best flights to your dream destinations around the world.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
    marginBottom: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  content: {
    maxWidth: width * 0.9,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#00A6E8",
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    color: "#9ca3af",
  },
});
