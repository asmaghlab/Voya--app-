import { View, Text, ImageBackground, StyleSheet } from "react-native";

export const SpecialDealsSection = () => {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800",
      }}
      style={styles.bg}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Discover Special Deals!</Text>
        <Text style={styles.text}>
          Make sure to check out these{"\n"}
          <Text style={styles.bold}>promotions</Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { height: 360, justifyContent: "center" },
  overlay: {
    backgroundColor: "rgba(14,165,233,0.85)",
    padding: 24,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  text: { color: "#e0f2fe", fontSize: 18, marginTop: 12 ,textAlign: "center"},
  bold: { fontSize: 22, fontWeight: "600" },
});
