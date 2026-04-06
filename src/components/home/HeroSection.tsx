import { View, Text, ImageBackground, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";

export const HeroSection = () => {
  const navigation = useNavigation<any>();

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" }}
      style={styles.bg}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Discover Your Next Trip</Text>
        <Text style={styles.sub}>
          Flights • Hotels • Destinations
        </Text>

        <Pressable
          style={styles.btn}
          onPress={() => navigation.navigate("Flights")}
        >
          <Text style={styles.btnText}>Search Flights</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { height: 380, justifyContent: "center" },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 24,
  },
  title: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  sub: { color: "#ddd", marginVertical: 12 },
  btn: {
    backgroundColor: "#0ea5e9",
    padding: 14,
    borderRadius: 12,
    width: 160,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
