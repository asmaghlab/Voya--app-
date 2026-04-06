import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Pagination = ({ totalPages, currentPage, setCurrentPage }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.disabledButton]}
        disabled={currentPage === 1}
        onPress={() => setCurrentPage(currentPage - 1)}
      >
        <Text style={styles.buttonText}>Prev</Text>
      </TouchableOpacity>

 

      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.disabledButton]}
        disabled={currentPage === totalPages}
        onPress={() => setCurrentPage(currentPage + 1)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    justifyContent: "center",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#1f2937",
    fontWeight: "500",
    fontSize: 14,
  },
  pagesWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  pageNumber: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 2,
  },
  activePageNumber: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  pageNumberText: {
    color: "#1f2937",
    fontWeight: "500",
    fontSize: 14,
  },
  activePageNumberText: {
    color: "#ffffff",
  },
});

export default Pagination;
