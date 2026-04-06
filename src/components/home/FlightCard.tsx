import { View, Text, Pressable, StyleSheet } from "react-native";
import { Plane, Clock, Users, Heart } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../screens/Wishlist/wishlistSlice";

interface FlightCardProps {
  flight: any;
}

export const FlightCard = ({ flight }: FlightCardProps) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: any) => s.auth);
  const { items } = useAppSelector((s: any) => s.wishlist);

  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    const found = items.find(
      (i: any) =>
        i.itemId === flight.id.toString() &&
        i.itemType === "flight" &&
        i.userId === user?.id?.toString()
    );

    setIsFav(!!found);
    setFavId(found?.id || null);
  }, [items, user]);

  const toggleFav = () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }

    if (isFav && favId) {
      dispatch(removeFromWishlist(favId));
    } else {
      dispatch(
        addToWishlist({
          userId: user.id.toString(),
          itemId: flight.id.toString(),
          itemType: "flight",
          name: flight.airline,
          price: flight.price,
          image: flight.image || "https://via.placeholder.com/300",
        })
      );
    }
  };

  const handleCardPress = () => {
    // Navigate to FlightDetails screen with flight ID
    navigation.navigate('Flights', {
      screen: 'FlightDetails',
      params: { id: flight.id }
    });
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handleCardPress}
    >
      {/* Heart */}
      <Pressable
        style={styles.heart}
        onPress={(e) => {
          e.stopPropagation();
          toggleFav();
        }}
      >
        <Heart
          size={24}
          color={isFav ? "red" : "gray"}
          fill={isFav ? "red" : "none"}
        />
      </Pressable>

      <View style={styles.header}>
        <Plane color="#0ea5e9" size={20} />
        <Text style={styles.airline}>{flight.airline}</Text>
      </View>

      <Text style={styles.route}>
        {flight.from} → {flight.to}
      </Text>

      <View style={styles.row}>
        <Clock size={14} color="#6b7280" />
        <Text style={styles.detail}>{flight.duration}</Text>
        <Users size={14} color="#6b7280" />
        <Text style={styles.detail}>{flight.passenger}</Text>
      </View>

      <Text style={styles.price}>${flight.price}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heart: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  airline: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  route: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    alignItems: "center",
  },
  detail: {
    fontSize: 14,
    color: "#6b7280",
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0ea5e9",
    marginTop: 12,
  },
});