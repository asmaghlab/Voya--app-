import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { AddHotelSchemaType } from "../../../../features/hotels/type";

interface Props {
  control: Control<AddHotelSchemaType>;
  errors: FieldErrors<AddHotelSchemaType>;
  setValue: UseFormSetValue<AddHotelSchemaType>;
}

export default function HotelFormFields({ control, errors }: Props) {
  const renderInput = (
    name: keyof AddHotelSchemaType,
    label: string,
    keyboardType: "default" | "numeric" = "default",
    multiline = false
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.textarea,
              errors[name] && styles.errorInput,
            ]}
            value={value?.toString() ?? ""}
            onChangeText={onChange}
            keyboardType={keyboardType}
            multiline={multiline}
          />
        )}
      />

      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderInput("name", "Hotel Name")}
      {renderInput("countryId", "Country")}
      {renderInput("cityId", "City")}
      {renderInput("pricePerNight", "Price Per Night", "numeric")}
      {renderInput("stars", "Stars", "numeric")}
      {renderInput("rating", "Rating", "numeric")}
      {renderInput("lat", "Latitude", "numeric")}
      {renderInput("lng", "Longitude", "numeric")}
      {renderInput("phone", "Phone")}
      {renderInput("website", "Website")}
      {renderInput("reviewCount", "Review Count", "numeric")}
      {renderInput("currency", "Currency")}
      {renderInput("amenities", "Amenities (comma separated)")}
      {renderInput("address", "Address")}
      {renderInput("neighborhood", "Neighborhood")}
      {renderInput("propertyType", "Property Type")}
      {renderInput("distanceFromCenter", "Distance From Center")}
      {renderInput("checkIn", "Check-in Time")}
      {renderInput("checkOut", "Check-out Time")}
      {renderInput("offers", "Offers")}
      {renderInput("images", "Images (comma separated)")}
      {renderInput("description", "Description", "default", true)}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    marginTop: 4,
    fontSize: 12,
  },
});
