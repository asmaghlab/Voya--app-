import { 
  View, 
  Text, 
  Image, 
  Pressable, 
  StyleSheet, 
  Animated, 
  Dimensions, 
} from "react-native";
import { useEffect, useRef } from "react";
import { ArrowRight, Hotel, Plane } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { fetchDestinations } from "../../features/homeslices/destinationsSlice";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 240;
const CARD_SPACING = 16;

export const DestinationsSection = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { items, loading, error } = useAppSelector(s => s.destinations);

  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList>(null);

  useEffect(() => {
    dispatch(fetchDestinations());
  }, []);

  // الحركة التلقائية للسلايدر
  useEffect(() => {
    if (!items || items.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % items.length;
      listRef.current?.scrollToOffset({
        offset: index * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [items]);

  if (loading) return <Text style={styles.center}>Loading...</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Destinations</Text>
        <View style={styles.underline} />
      </View>

      <Animated.FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false} // ممنوع السحب اليدوي
        contentContainerStyle={{ paddingHorizontal: 0 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        renderItem={({ item, index }) => {
          const inputRange = [
            (CARD_WIDTH + CARD_SPACING) * (index - 1),
            (CARD_WIDTH + CARD_SPACING) * index,
            (CARD_WIDTH + CARD_SPACING) * (index + 1),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [20, 0, 20],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={{
                width: CARD_WIDTH,
                marginRight: CARD_SPACING,
                transform: [{ scale }, { translateY }],
              }}
            >
              <CardItem item={item} navigation={navigation} />
            </Animated.View>
          );
        }}
      />

      <Pressable 
        style={({ pressed }) => [
          styles.allButton,
          pressed && styles.allButtonPressed
        ]}
        onPress={() => navigation.navigate("Countries")}
      >
        <Text style={styles.link}>View All Destinations</Text>
        <ArrowRight size={18} color="#0ea5e9" />
      </Pressable>
    </View>
  );
};

const CardItem = ({ item, navigation }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.darkOverlay} />
        <View style={styles.overlay}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              onPress={() => navigation.navigate("Hotels", { countryId: item.id })}
            >
              <Hotel color="#fff" size={18} />
              <Text style={styles.buttonText}>Hotels</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              onPress={() => navigation.navigate("Flights", { destination: item.name })}
            >
              <Plane color="#fff" size={18} />
              <Text style={styles.buttonText}>Flights</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical:16, backgroundColor: '#ffffff' , paddingHorizontal: 16, },
  header: { marginBottom: 16, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "700", color: '#000000', marginBottom: 6 },
  underline: { width: 45, height: 3, backgroundColor: '#0ea5e9', borderRadius: 2 },
  card: { width: CARD_WIDTH, height: 300, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  cardPressed: { shadowOpacity: 0.15 },
  image: { width: "100%", height: "100%", position: 'absolute' },
  darkOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'transparent', zIndex: 10 },
  name: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 5, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  desc: { color: "rgba(255,255,255,0.95)", fontSize: 12, lineHeight: 16, marginBottom: 16, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  iconButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 8, borderRadius: 8, gap: 5 },
  iconButtonPressed: { backgroundColor: 'rgba(255, 255, 255, 0.3)', transform: [{ scale: 0.98 }] },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  allButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, paddingHorizontal: 10, paddingVertical: 10, gap: 8 },
  allButtonPressed: { backgroundColor: '#f1f5f9', transform: [{ scale: 0.98 }] },
  link: { color: "#0ea5e9", fontWeight: "600", fontSize: 14 },
  center: { textAlign: "center", marginTop: 40, fontSize: 16, color: '#666' },
  error: { color: "red", textAlign: "center", marginTop: 40, fontSize: 16 },
});
