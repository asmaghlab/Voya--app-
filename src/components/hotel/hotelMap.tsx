import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface HotelMapProps {
  lat: string | undefined;
  lng: string | undefined;
}

const HotelMap = ({ lat, lng }: HotelMapProps) => {
  const latitude =  Number(lat) ;
  const longitude =  Number(lng);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
        />
      </MapView>
    </View>
  );
};

export default HotelMap;

const styles = StyleSheet.create({
  container: {
    height: 250, 
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 16,
  },
  map: {
    flex: 1,
  },
});
