import { Dimensions, StyleSheet } from "react-native";
const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.8;

export const FilterStyles = StyleSheet.create({
  filterBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  // overlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   flexDirection: "row",
  //   zIndex: 1500, // مهم جدًا
  //   elevation: 1000, // Android
  // },
overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999,
},

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    padding: 16,
    zIndex: 1001,
    elevation: 1001,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  close: {
    fontSize: 22,
  },
  label: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  priceText: {
    textAlign: "center",
    marginTop: 6,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  rowText: {
    fontSize: 15,
  },
});
