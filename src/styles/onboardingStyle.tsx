import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  page: {
    width,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  illustration: {
    width: width * 0.85,
    height: height * 0.45,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  skipText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#00A6E8",
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00A6E8",
    justifyContent: "center",
    alignItems: "center",
  },
  nextIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
