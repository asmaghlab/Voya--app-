import React from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface HotelSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  starsFilter: number | "";
  setStarsFilter: (value: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (value: number | "") => void;
  allCities: string[];
}

const HotelSearch: React.FC<HotelSearchProps> = ({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  starsFilter,
  setStarsFilter,
  maxPrice,
  setMaxPrice,
  allCities,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Filter Hotels</Text>

      {/* Search by Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Search Hotel Name</Text>
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Enter hotel name..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* City Filter */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cityFilter}
            onValueChange={(value) => setCityFilter(value)}
            style={styles.picker}
          >
            <Picker.Item label="All Cities" value="" />
            {allCities.map((city) => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Stars Filter */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Stars Rating</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={starsFilter}
            onValueChange={(value) => setStarsFilter(value === "" ? "" : Number(value))}
            style={styles.picker}
          >
            <Picker.Item label="All Ratings" value="" />
            <Picker.Item label="⭐ 1 Star" value={1} />
            <Picker.Item label="⭐⭐ 2 Stars" value={2} />
            <Picker.Item label="⭐⭐⭐ 3 Stars" value={3} />
            <Picker.Item label="⭐⭐⭐⭐ 4 Stars" value={4} />
            <Picker.Item label="⭐⭐⭐⭐⭐ 5 Stars" value={5} />
          </Picker>
        </View>
      </View>

      {/* Max Price Filter */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Max Price per Night</Text>
        <TextInput
          style={styles.input}
          value={maxPrice === "" ? "" : maxPrice.toString()}
          onChangeText={(text) => {
            const num = parseInt(text);
            setMaxPrice(isNaN(num) ? "" : num);
          }}
          placeholder="Enter max price..."
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1f2937",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#1f2937",
  },
});

export default HotelSearch;