import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react-native";

export const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://6934ceba4090fe3bf020c412.mockapi.io/api/v1/hotels")
      .then(res => res.json())
      .then(data => {
        setItems(data.slice(0, 10));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load testimonials");
        setLoading(false);
      });
  }, []);

  if (loading) return <Text style={styles.center}>Loading...</Text>;
  if (error) return <Text style={styles.center}>{error}</Text>;

  const item = items[index];
// Get image or fallback to avatar service
  const imageUri =
    item.images && item.images.length > 0
      ? item.images[0]
      : `https://ui-avatars.com/api/?name=${item.name}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Top Rated <Text style={styles.primary}>Hotels</Text>
      </Text>

      <View style={styles.card}>
        <Quote size={60} color="#e0f2fe" style={styles.quote} />

        <Image
          source={{ uri: imageUri }}
          style={styles.avatar}
        />

        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              color={i < (item.rating || 5) ? "#facc15" : "#af8787ff"}
              fill={i < (item.rating || 5) ? "#facc15" : "none"}
            />
          ))}
        </View>

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>
          {typeof item.location === 'object'
            ? item.location?.formattedAddress || "Traveler"
            : item.location || "Traveler"}
        </Text>

        <View style={styles.nav}>
          <Pressable
            onPress={() =>
              setIndex((index - 1 + items.length) % items.length)
            }
          >
            <ChevronLeft />
          </Pressable>

          <Text>
            {index + 1} / {items.length}
          </Text>

          <Pressable
            onPress={() => setIndex((index + 1) % items.length)}
          >
            <ChevronRight />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { textAlign: "center", marginTop: 40 },
  header: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  primary: { color: "#0ea5e9" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  quote: { position: "absolute", top: 10, right: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  stars: { flexDirection: "row", gap: 4 },
  name: { fontWeight: "bold", marginTop: 8 },
  role: { color: "#666" },

  nav: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
    alignItems: "center",
  },
});
