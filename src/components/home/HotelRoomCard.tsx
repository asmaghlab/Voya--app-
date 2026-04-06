import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Heart, BedDouble } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { addToWishlist, removeFromWishlist } from "../../screens/Wishlist/wishlistSlice";

interface HotelRoomCardProps {
  room: any;
}

export const HotelRoomCard = ({ room }: HotelRoomCardProps) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s: any) => s.wishlist);
  const { user } = useAppSelector((s: any) => s.auth);

  const isFav = items.some(
    (i: any) => i.itemId === room.id.toString() && i.itemType === "hotel" && i.userId === user?.id?.toString()
  );

  const toggleFav = () => {
    if (isFav) {
      const fav = items.find((i: any) => i.itemId === room.id.toString() && i.userId === user?.id?.toString());
      if (fav) dispatch(removeFromWishlist(fav.id));
    } else {
      dispatch(
        addToWishlist({
          userId: user?.id?.toString() || "",
          itemId: room.id.toString(),
          itemType: "hotel",
          name: room.name,
          price: room.price,
          image: room.image || "",
        })
      );
    }
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("HotelDetails", { id: room.id })}
    >
      <Image source={{ uri: room.image }} style={styles.image} />

      <Pressable onPress={toggleFav} style={styles.heart}>
        <Heart
          color={isFav ? "#0ea5e9" : "#999"}
          fill={isFav ? "#0ea5e9" : "none"}
        />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.name}>{room.name}</Text>

        <View style={styles.row}>
          <BedDouble size={14} />
          <Text>{room.beds} Beds</Text>
        </View>

        <Text style={styles.price}>${room.price} / night</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: { height: 180, width: "100%" },
  heart: { position: "absolute", top: 12, right: 12 },
  content: { padding: 14 },
  name: { fontWeight: "600", fontSize: 16 },
  row: { flexDirection: "row", gap: 6, marginVertical: 8 },
  price: { color: "#0ea5e9", fontWeight: "bold" },
});
