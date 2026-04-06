// FlightsSearch.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Picker } from '@react-native-picker/picker';

interface FlightsSearchProps {
  fromSearch: string;
  toSearch: string;
  setFromSearch: (v: string) => void;
  setToSearch: (v: string) => void;
  cityFilter: string;
  airlineFilter: string;
  setCityFilter: (v: string) => void;
  setAirlineFilter: (v: string) => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;
  allCities: string[];
  allAirlines: string[];
}

export const FlightsSearch = ({
  fromSearch,
  toSearch,
  setFromSearch,
  setToSearch,
  cityFilter,
  airlineFilter,
  setCityFilter,
  setAirlineFilter,
  maxPrice,
  setMaxPrice,
  allCities,
  allAirlines,
}: FlightsSearchProps) => {
  return (
    <View style={styles.container}>
      
      {/* First Row: City + Airline */}
<View style={styles.row}>
  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
    <Text style={styles.label}>City</Text>
    <Picker
      selectedValue={cityFilter}
      onValueChange={(v) => setCityFilter(v)}
    >
      <Picker.Item label="Select City" value="" />
      {allCities.map((c) => (
        <Picker.Item key={c} label={c} value={c} />
      ))}
    </Picker>
  </View>

  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
    <Text style={styles.label}>Airline</Text>
    <Picker
      selectedValue={airlineFilter}
      onValueChange={(v) => setAirlineFilter(v)}
    >
      <Picker.Item label="Select Airline" value="" />
      {allAirlines.map((a) => (
        <Picker.Item key={a} label={a} value={a} />
      ))}
    </Picker>
  </View>
</View>


      {/* Max Price Row */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Max Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Max Price..."
            keyboardType="numeric"
            value={maxPrice === "" ? "" : maxPrice.toString()}
            onChangeText={(v) => setMaxPrice(v === "" ? "" : parseFloat(v))}
          />
        </View>
      </View>

      {/* From & To Row */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            placeholder="From..."
            value={fromSearch}
            onChangeText={setFromSearch}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="To..."
            value={toSearch}
            onChangeText={setToSearch}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  inputContainer: {
    minWidth: 120,
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
