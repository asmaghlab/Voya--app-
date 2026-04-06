import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;
export const HotelCardStyle = StyleSheet.create({
  container: {
    width: cardWidth,
    paddingVertical:16
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    height:330,
  },
  image: {
    width: "100%",
    height: 160,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  details: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00A6E8",
  },
});
