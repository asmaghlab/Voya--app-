import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import Slider from "@react-native-community/slider";
import { FilterStyles } from "./FilterStyle";
import { IHotel } from "../../features/hotels/type";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.8;

interface FilterDrawerProps {
  allHotels: IHotel[];
  minPrice: number;
  maxPrice: number;
  onFilterChange: (filters: {
    distanceFromCenter: string[];
    cityId: string[];
    stars: number[];
    pricePerNight: number;
  }) => void;
}

const distanceGroups = [
  { label: "0.5 - 1 km", value: "0.5-1" },
  { label: "1 - 3 km", value: "1-3" },
  { label: "3 - 5 km", value: "3-5" },
  { label: "5 - 10 km", value: "5-10" },
  { label: "10+ km", value: "10+" },
];

export default function FilterDrawer({
  allHotels,
  minPrice,
  maxPrice,
  onFilterChange,
}: FilterDrawerProps) {
  const slideAnim = useState(new Animated.Value(DRAWER_WIDTH))[0];
  const [visible, setVisible] = useState(false);

  // Filters
  const [stars, setStars] = useState<number[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [distances, setDistances] = useState<string[]>([]);
  const [price, setPrice] = useState(maxPrice);

  const cityId = useMemo(
    () => Array.from(new Set(allHotels.map((h) => h.cityId))).filter(Boolean),
    [allHotels]
  );

  const toggle = <T,>(arr: T[], value: T) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const openDrawer = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  useEffect(() => {
    onFilterChange({
      distanceFromCenter: distances,
      cityId: cities,
      stars,
      pricePerNight: price,
    });
  }, [stars, cities, distances, price]);

  return (
    <>
      {/* Button */}
      <Pressable style={FilterStyles.filterBtn} onPress={openDrawer}>
        <Text style={FilterStyles.filterBtnText}>Filters</Text>
      </Pressable>

  <Modal
    visible={visible}
    transparent
    animationType="none"
    onRequestClose={closeDrawer}
  >
        <View style={FilterStyles.overlay}>
          <Pressable style={FilterStyles.backdrop} onPress={closeDrawer} />

          <Animated.View
            style={[FilterStyles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <ScrollView>
              {/* Header */}
              <View style={FilterStyles.header}>
                <Text style={FilterStyles.title}>Filters</Text>
                <Pressable onPress={closeDrawer}>
                  <Text style={FilterStyles.close}>✕</Text>
                </Pressable>
              </View>

              {/* Price */}
              <Text style={FilterStyles.label}>Price per night</Text>
              <Slider
                minimumValue={minPrice}
                maximumValue={maxPrice}
                value={price}
                onValueChange={setPrice}
                step={1}
              />
              <Text style={FilterStyles.priceText}>{price} $</Text>

              {/* Stars */}
              <Text style={FilterStyles.label}>Stars</Text>
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable
                  key={s}
                  style={FilterStyles.row}
                  onPress={() => setStars(toggle(stars, s))}
                >
                  <Text>{stars.includes(s) ? "☑" : "☐"}</Text>
                  <Text style={FilterStyles.rowText}>{s} Stars</Text>
                </Pressable>
              ))}

              {/* City */}
              <Text style={FilterStyles.label}>City</Text>
              {cityId.map((c) => (
                <Pressable
                  key={c}
                  style={FilterStyles.row}
                  onPress={() => setCities(toggle(cities, c!))}
                >
                  <Text>{cities.includes(c!) ? "☑" : "☐"}</Text>
                  <Text style={FilterStyles.rowText}>{c}</Text>
                </Pressable>
              ))}

              {/* Distance */}
              <Text style={FilterStyles.label}>Distance</Text>
              {distanceGroups.map((d) => (
                <Pressable
                  key={d.value}
                  style={FilterStyles.row}
                  onPress={() => setDistances(toggle(distances, d.value))}
                >
                  <Text>{distances.includes(d.value) ? "☑" : "☐"}</Text>
                  <Text style={FilterStyles.rowText}>{d.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      )
        </Modal>
    </>
  );
}
