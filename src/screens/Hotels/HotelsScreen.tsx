import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Text,
  TextInput,
  StatusBar,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { IHotel } from "../../features/hotels/type";
import HotelCard from "../../components/hotel/hotelCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import HeroSection from "../Countries/HeroSection";
import HotelSearch from "./HotelSearch";
import Pagination from "../Flights/FlightsComponents/Pagination";
import { fetchHotels } from "../../features/hotels/hotelsSlice";
import { AppDispatch, RootState } from "../../routes/store";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface HotelScreenProp {
  hotels: IHotel[];
  status: "loading" | "failed" | "idle" | "succeeded";
  error: string | null;
}

export default function HotelsScreen({ hotels, status, error }: HotelScreenProp) {
  const dispatch = useDispatch<AppDispatch>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [starsFilter, setStarsFilter] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilters, setOpenFilters] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const numColumns = 2;
  const rowsPerPage = 4;
  const itemsPerPage = numColumns * rowsPerPage;

  // Fetch hotels on mount
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const filterHotel = (hotel: IHotel) => {
    const nameMatch = !searchTerm || hotel.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = !cityFilter || hotel.cityId === cityFilter;
    const starsMatch = starsFilter === "" || hotel.stars === starsFilter;
    const priceMatch = maxPrice === "" || hotel.pricePerNight! <= maxPrice;
    return nameMatch && cityMatch && starsMatch && priceMatch;
  };

  const filteredHotels = hotels.filter(filterHotel);
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const openSheet = () => {
    setOpenFilters(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setOpenFilters(false));
  };

  const handleShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => openSheet());
  };

  const allCities = hotels
    .map(h => h.cityId)
    .filter((city): city is string => city !== undefined && city !== null)
    .filter((city, index, self) => self.indexOf(city) === index);

  if (status === "loading") {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (status === "failed") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#ef4444", fontSize: 14 }}>
          {error ?? "Failed to load hotels"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <HeroSection
          title="Hotels"
          description="Discover breathtaking places around the globe."
        />

        <FlatList
          data={currentHotels}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              onPress={() =>
                navigation.navigate("HotelDetails", { id: item.id.toString() })
              }
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 8,
            marginBottom: 12,
          }}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, fontSize: 16, color: "#777" }}>
              No hotels found
            </Text>
          }
        />

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </ScrollView>

      <Animated.View
        style={{
          transform: [{ translateX: shakeAnim }],
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
        }}
      >
        <Pressable
          onPress={handleShake}
          style={{
            backgroundColor: "#0ea5e9",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 30,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Filters</Text>
        </Pressable>
      </Animated.View>

      <Modal transparent visible={openFilters} animationType="none">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={closeSheet}
        />

        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
            maxHeight: "85%",
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#d1d5db",
              borderRadius: 4,
              alignSelf: "center",
              marginBottom: 12,
            }}
          />

          <HotelSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            starsFilter={starsFilter}
            setStarsFilter={setStarsFilter}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            allCities={allCities}
          />

          <Pressable
            onPress={closeSheet}
            style={{
              marginTop: 12,
              backgroundColor: "#0ea5e9",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Show Results
            </Text>
          </Pressable>
        </Animated.View>
      </Modal>
    </View>
  );
}
