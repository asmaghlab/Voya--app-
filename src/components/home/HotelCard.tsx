import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { Heart, Star, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../screens/Wishlist/wishlistSlice";
import { useEffect, useState } from "react";

interface HotelCardProps {
  hotel: any;
}

export const HotelCard = ({ hotel }: HotelCardProps) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s: any) => s.wishlist);
  const { user } = useAppSelector((s: any) => s.auth);

  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    const found = items.find(
      (i: any) =>
        i.itemId === hotel.id.toString() &&
        i.itemType === "hotel" &&
        i.userId === user?.id?.toString()
    );

    setIsFav(!!found);
    setFavId(found?.id || null);
  }, [items, user]);

  const toggleWishlist = () => {
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
          itemId: hotel.id.toString(),
          itemType: "hotel",
          name: hotel.name,
          price: hotel.price,
          image: hotel.image || "https://via.placeholder.com/300",
        })
      );
    }
  };

  const handleCardPress = () => {
  //handle navigation to HotelDetails screen
    navigation.navigate('Hotels', {
      screen: 'HotelDetails',
      params: { id: hotel.id }
    });
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handleCardPress}
    >
      {/* Image */}
      <Image 
        source={{ uri: hotel.image || "https://via.placeholder.com/300" }} 
        style={styles.image} 
      />

      {/* Heart */}
      <Pressable
        style={styles.heart}
        onPress={(e) => {
          e.stopPropagation();
          toggleWishlist();
        }}
      >
        <Heart
          size={24}
          color={isFav ? "red" : "gray"}
          fill={isFav ? "red" : "none"}
        />
      </Pressable>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name}
        </Text>

        <View style={styles.location}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.locationText} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>

        <View style={styles.rating}>
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.ratingText}>{hotel.rating}</Text>
        </View>

        <Text style={styles.price}>${hotel.price}/night</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  heart: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
    elevation: 3,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationText: {
    marginLeft: 6,
    color: "#6b7280",
    fontSize: 14,
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 4,
  },
});