import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  FlatList,
  Dimensions,
} from "react-native";
import { FontAwesome, MaterialIcons, Entypo } from "@expo/vector-icons"; // Icons for stars, phone, globe

const { width } = Dimensions.get("window");

interface ViewHotelModalProps {
  hotel: any;
}

export default function ViewHotelModal({ hotel }: ViewHotelModalProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (!hotel) return null;

  const nextImg = () => {
    if (!hotel.images) return;
    setImgIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImg = () => {
    if (!hotel.images) return;
    setImgIndex((prev) => (prev === 0 ? hotel.images.length - 1 : prev - 1));
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <MaterialIcons name="remove-red-eye" size={20} color="#2563eb" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOpen(false)}
            >
              <Entypo name="cross" size={24} color="#000" />
            </TouchableOpacity>

            {/* Hotel Name */}
            <Text style={styles.hotelName}>{hotel.name}</Text>

            {/* Image Slider */}
            {hotel.images?.length > 0 && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: hotel.images[imgIndex] }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {hotel.images.length > 1 && (
                  <>
                    <TouchableOpacity
                      onPress={prevImg}
                      style={[styles.navBtn, { left: 10 }]}
                    >
                      <Text style={styles.navBtnText}>❮</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={nextImg}
                      style={[styles.navBtn, { right: 10 }]}
                    >
                      <Text style={styles.navBtnText}>❯</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Details */}
            <ScrollView style={{ marginTop: 12 }}>
              {/* Location */}
              <Text style={styles.detailText}>
                <FontAwesome name="map-marker" size={16} color="red" />{" "}
                {hotel.cityId}, {hotel.countryId}
              </Text>

              {/* Price */}
              {hotel.pricePerNight && (
                <Text style={[styles.detailText, { color: "green" }]}>
                  <FontAwesome name="dollar" size={16} /> {hotel.pricePerNight}{" "}
                  / night
                </Text>
              )}

              {/* Stars & Rating */}
              <View style={styles.starsContainer}>
                {Array(hotel.stars)
                  .fill(0)
                  .map((_, i) => (
                    <FontAwesome key={i} name="star" size={16} color="gold" />
                  ))}
                <Text style={{ marginLeft: 6, color: "#555" }}>
                  ({hotel.reviewCount} reviews)
                </Text>
              </View>

              {/* Distance */}
              {hotel.distanceFromCenter && (
                <Text style={styles.detailText}>
                  Distance: {hotel.distanceFromCenter} from center
                </Text>
              )}

              {/* Amenities */}
              <FlatList
                data={hotel.amenities}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.amenity}>
                    <Text>{item}</Text>
                  </View>
                )}
                style={{ marginVertical: 8 }}
              />

              {/* Contact */}
              {hotel.phone && (
                <Text style={styles.detailText}>
                  <FontAwesome name="phone" size={16} color="#2563eb" />{" "}
                  {hotel.phone}
                </Text>
              )}

              {hotel.website && (
                <Text
                  style={[styles.detailText, { color: "#2563eb" }]}
                  onPress={() => Linking.openURL(hotel.website)}
                >
                  <FontAwesome name="globe" size={16} color="#2563eb" /> Visit
                  Website
                </Text>
              )}

              {/* Description */}
              {hotel.description && (
                <Text style={[styles.detailText, { marginTop: 8 }]}>
                  {hotel.description}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
  hotelName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  navBtn: {
    position: "absolute",
    top: "45%",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 6,
    borderRadius: 20,
  },
  navBtnText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  amenity: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 6,
    borderRadius: 12,
  },
});
