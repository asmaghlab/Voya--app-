import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "./wishlistSlice";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


const ITEMS_PER_PAGE = 3;

const WishlistScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { items, loading } = useAppSelector((state) => state.wishlist);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id.toString()));
    }
  }, [dispatch, user]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRemove = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const handleClearAll = () => {
    if (user?.id) {
      dispatch(clearWishlist(user.id.toString()));
      setCurrentPage(1);
    }
  };

  const handleViewDetails = (item: any) => {
    if (item.itemType === "hotel") {
      navigation.navigate("Hotels", {
        screen: "HotelDetails",
        params: { id: item.id },
      });
    } else {
      navigation.navigate('Flights', {
      screen: 'FlightDetails',
      params: { id: item.id }
    });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={64} color="#9ca3af" />
        <Text style={styles.title}>Wishlist Empty</Text>
        <Text style={styles.sub}>Start adding hotels & flights</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Wishlist</Text>
          <Text style={styles.sub}>{items.length} items saved</Text>
        </View>

        <Pressable style={styles.clear} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
          <Text style={{ color: "#ef4444" }}>Clear</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={paginatedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Badge */}
            <View style={styles.badge}>
              <Ionicons
                name={item.itemType === "hotel" ? "bed-outline" : "airplane-outline"}
                size={14}
                color="#fff"
              />
              <Text style={{ color: "#fff", marginLeft: 4 }}>
                {item.itemType}
              </Text>
            </View>

            {/* Remove */}
            <Pressable
              style={styles.remove}
              onPress={() => handleRemove(item.id)}
            >
              <Ionicons name="heart" size={18} color="#ef4444" />
            </Pressable>

            <View style={styles.content}>
              <Text style={styles.name}>{item.name}</Text>

              {item.location && (
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={14} />
                  <Text>{item.location}</Text>
                </View>
              )}

              {item.rating && (
                <View style={styles.row}>
                  <Ionicons name="star" size={14} color="#facc15" />
                  <Text>{item.rating}</Text>
                </View>
              )}

              <View style={styles.footer}>
                <View>
                  <Text style={styles.price}>${item.price}</Text>
                  <Text style={styles.small}>
                    {item.itemType === "hotel" ? "per night" : "total"}
                  </Text>
                </View>

                <Pressable
                  style={styles.details}
                  onPress={() => handleViewDetails(item)}
                >
                  <Text style={{ color: "#fff" }}>View</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((p) => p - 1)}
          >
            <Text>Previous</Text>
          </Pressable>

          <Text>
            {currentPage} / {totalPages}
          </Text>

          <Pressable
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((p) => p + 1)}
          >
            <Text>Next</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WishlistScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  sub: {
    color: "#6b7280",
  },
  clear: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  remove: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  small: {
    fontSize: 12,
    color: "#6b7280",
  },
  details: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
});
