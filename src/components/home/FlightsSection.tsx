import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions
} from "react-native";
import { useEffect, useRef } from "react";
import { Heart, Plane, ChevronRight, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { fetchCountries } from "../../features/flights/flightsSlice";
import {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} from "../../screens/Wishlist/wishlistSlice";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FlightsSection = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();

  const { countries, status, error } = useAppSelector(
    (s: any) => s.flights
  );
  const { items: wishlistItems } = useAppSelector(
    (s: any) => s.wishlist
  );
  const { user } = useAppSelector((s: any) => s.auth);

  // أنيميشن للسكشن
  const sectionFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCountries());
    }
    if (user) {
      dispatch(fetchWishlist(user.id.toString()));
    }
  }, [status, dispatch, user]);

  if (status === "loading")
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading flights...</Text>
      </View>
    );
  if (error) return <Text style={styles.error}>{error}</Text>;

  // Flights list
  const allFlights = (countries || [])
    .flatMap((country: any) =>
      (country.city || []).flatMap((city: any) =>
        (city.flights || []).map((flight: any) => ({
          ...flight,
          image:
            flight.image && flight.image.startsWith("http")
              ? flight.image
              : country.image,
        }))
      )
    )
    .slice(0, 6);

  const isInWishlist = (flightId: number) =>
    wishlistItems.some(
      (item: any) =>
        item.itemId === flightId.toString() &&
        item.itemType === "flight" &&
        item.userId === user?.id?.toString()
    );

  const toggleWishlist = (flight: any) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }

    if (isInWishlist(flight.id)) {
      const item = wishlistItems.find(
        (i: any) =>
          i.itemId === flight.id.toString() &&
          i.itemType === "flight"
      );
      if (item) dispatch(removeFromWishlist(item.id));
    } else {
      dispatch(
        addToWishlist({
          userId: user.id.toString(),
          itemId: flight.id.toString(),
          itemType: "flight",
          name: flight.airline,
          price: flight.price,
          image: flight.image,
        })
      );
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: sectionFade }
      ]}
    >
      {/* Header مختصر */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Top Flights</Text>
        </View>
        <View style={styles.underline} />
        <Pressable
          style={styles.viewAllButton}
          onPress={() => navigation.navigate("Flights")}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#0ea5e9" />
        </Pressable>
      </View>

      {/* قائمة الرحلات */}
      <FlatList
        data={allFlights}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <FlightCard
            flight={item}
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

// مكون FlightCard بحجم أصغر
const FlightCard = ({ flight, index, isInWishlist, toggleWishlist, navigation }: any) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // أنيميشن ظهور سريعة
    const delay = index * 80;
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateX, {
          toValue: 0,
          tension: 80,
          friction: 8,
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
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        onPress={() =>
          navigation.navigate('Flights', {
            screen: 'FlightDetails',
            params: { id: flight.id }
          })
        }
      >
        {/* صورة الرحلة */}
        <Image 
          source={{ uri: flight.image }} 
          style={styles.image}
          resizeMode="cover"
        />

        {/* طبقة داكنة خفيفة */}
        <View style={styles.imageOverlay} />

        {/* محتوى الكارد */}
        <View style={styles.cardContent}>
          {/* اسم شركة الطيران */}
          <Text style={styles.airline} numberOfLines={1}>
            {flight.airline || "Airline"}
          </Text>

          {/* المسار */}
          <View style={styles.locationRow}>
            <MapPin size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {flight.from || "From"} → {flight.to || "To"}
            </Text>
          </View>

          {/* السعر */}
          <Text style={styles.price}>
            ${flight.price || 0}
          </Text>
        </View>

        {/* زر Wishlist صغير */}
        <Pressable
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
        >
          <Heart
            size={16}
            color={isInWishlist ? "#ff4757" : "#fff"}
            fill={isInWishlist ? "#ff4757" : "none"}
          />
        </Pressable>

        {/* شارة Direct صغيرة */}
        {flight.direct && (
          <View style={styles.directBadge}>
            <Text style={styles.directText}>DIRECT</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
    backgroundColor: '#fee2e2',
    marginHorizontal: 16,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    gap: 4,
  },
  viewAllText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  cardWrapper: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    width: 160,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  airline: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 3,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  price: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  directText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  underline: { width: 45, height: 3, backgroundColor: '#0ea5e9', borderRadius: 2 },

});