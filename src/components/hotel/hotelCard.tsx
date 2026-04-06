import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // أو react-native-vector-icons
import { HotelCardStyle } from "./style/hotelCardStyle";
import { IHotel } from "../../features/hotels/type";

interface HotelCardProps {
  hotel: IHotel;
  onPress?: () => void;
}

export default function HotelCard({ hotel, onPress }: HotelCardProps) {
  return (
    <TouchableOpacity style={HotelCardStyle.container} onPress={onPress}>
      <View style={HotelCardStyle.card}>
        {/* Hotel Image */}
        <Image
          source={{ uri: hotel.images![0] }}
          style={HotelCardStyle.image}
        />

        {/* Hotel Info */}
        <View style={HotelCardStyle.info}>
          <Text style={HotelCardStyle.name}>{hotel.name}</Text>

          {/* Stars */}
          <View style={HotelCardStyle.stars}>
            {Array(hotel.stars)
              .fill(0)
              .map((_, i) => (
                <FontAwesome key={i} name="star" size={14} color="#facc15" />
              ))}
          </View>

          {/* City & Distance */}
          <Text style={HotelCardStyle.details}>
            {hotel.cityId} • {hotel.distanceFromCenter} km from center
          </Text>

          {/* Price */}
          <Text style={HotelCardStyle.price}>
            {hotel.pricePerNight} EGP / night
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
