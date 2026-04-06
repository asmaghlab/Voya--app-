import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { Heart, Star, ChevronRight, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { fetchHotels } from "../../features/hotels/hotelsSlice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "../../screens/Wishlist/wishlistSlice";

export const HotelsSection = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { hotels, status, error } = useAppSelector((s: any) => s.hotels);
  const { items: wishlistItems } = useAppSelector((s: any) => s.wishlist);
  const { user } = useAppSelector((s: any) => s.auth);
  const sectionFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "idle") dispatch(fetchHotels());
    if (user) dispatch(fetchWishlist(user.id.toString()));
  }, [status, dispatch, user]);

  if (status === "loading") return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading hotels...</Text>
    </View>
  );
  if (error) return <Text style={styles.error}>{error}</Text>;

  const displayHotels = (hotels || []).slice(0, 6);

  const isInWishlist = (hotelId: number) =>
    wishlistItems.some(
      (item: any) =>
        item.itemId === hotelId.toString() &&
        item.itemType === "hotel" &&
        item.userId === user?.id?.toString()
    );

  const toggleWishlist = (hotel: any) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    if (isInWishlist(hotel.id)) {
      const item = wishlistItems.find(
        (item: any) => item.itemId === hotel.id.toString() && item.itemType === "hotel"
      );
      if (item) dispatch(removeFromWishlist(item.id));
    } else {
      dispatch(
        addToWishlist({
          userId: user.id.toString(),
          itemId: hotel.id.toString(),
          itemType: "hotel",
          name: hotel.name,
          price: hotel.pricePerNight,
          image: hotel.images?.[0] || "",
        })
      );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: sectionFade }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Top Hotels</Text>
        </View>
        <View style={styles.underline} />
        <Pressable style={styles.viewAllButton} onPress={() => navigation.navigate("Hotels")}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#0ea5e9" />
        </Pressable>
      </View>
      <FlatList
        data={displayHotels}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <HotelCard
            hotel={item}
            index={index}
            isInWishlist={isInWishlist(item.id)}
            toggleWishlist={() => toggleWishlist(item)}
            navigation={navigation}
          />
        )}
      />
    </Animated.View>
  );
};

const HotelCard = ({ hotel, index, isInWishlist, toggleWishlist, navigation }: any) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateX = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateX, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardOpacity,
          transform: [
            { scale: cardScale },
            { translateX: cardTranslateX },
          ],
        }
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        onPress={() =>
          navigation.navigate("Hotels", {
            screen: "HotelDetails",
            params: { id: hotel.id },
          })
        }
      >
        <Image
          source={{ uri: hotel.images?.[0] || "https://via.placeholder.com/200" }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.cardContent}>
          <Text style={styles.hotelName} numberOfLines={1}>{hotel.name || "Hotel"}</Text>
          <View style={styles.locationRow}>
            <MapPin size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {hotel.city || "City"}, {hotel.country || "Country"}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <Star size={10} color="#FFD700" />
              <Text style={styles.ratingText}>{hotel.rating || "4.5"}</Text>
            </View>
            <Text style={styles.price}>${hotel.pricePerNight || 0}</Text>
          </View>
        </View>
        <Pressable
          style={styles.heartButton}
          onPress={(e) => { e.stopPropagation(); toggleWishlist(); }}
        >
          <Heart size={16} color={isInWishlist ? "#ff4757" : "#fff"} fill={isInWishlist ? "#ff4757" : "none"} />
        </Pressable>
        {hotel.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#fff', marginBottom: 8 },
  loadingContainer: { paddingVertical: 20, alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#666' },
  error: { color: '#ef4444', textAlign: 'center', padding: 16, fontSize: 14, backgroundColor: '#fee2e2', marginHorizontal: 16, borderRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginLeft: 6 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f8fafc', borderRadius: 16, gap: 4 },
  viewAllText: { color: '#0ea5e9', fontSize: 12, fontWeight: '600' },
  listContent: { paddingRight: 12, paddingVertical: 4 },
  cardWrapper: { marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  card: { width: 160, height: 200, borderRadius: 14, overflow: 'hidden', position: 'relative', backgroundColor: '#fff' },
  image: { width: '100%', height: '100%', position: 'absolute' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  hotelName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 3 },
  locationText: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 11, flex: 1, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, gap: 2 },
  ratingText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  price: { color: '#fff', fontSize: 16, fontWeight: '800', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  heartButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems: 'center', justifyContent: 'center' },
  featuredBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#ff6b6b', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  featuredText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
  underline: { width: 45, height: 3, backgroundColor: '#0ea5e9', borderRadius: 2 },
});
