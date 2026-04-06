import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Flight } from "../FlightsTypes/Flightstypes";

interface FlightCardProps {
  flight: Flight;
}

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export const FlightCard = ({ flight }: FlightCardProps) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("FlightDetails", {
          flightId: flight.id,
        })
      }
    >
      <View style={styles.card}>
        <Image
          source={{ uri: flight.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.airline} numberOfLines={1}>
            {flight.airline}
          </Text>

          <Text style={styles.route} numberOfLines={2}>
            {flight.city} | {flight.from} → {flight.to}
          </Text>

          <Text style={styles.price}>${flight.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: cardWidth * 1.3,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  airline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  route: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    marginTop: 4,
    color: "#00A6E8",
    fontSize: 16,
    fontWeight: "700",
  },
});
