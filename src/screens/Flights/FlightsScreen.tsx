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
} from "react-native";
import axios from "axios";
import { Flight, Country } from "./FlightsTypes/Flightstypes";
import { FlightHeroSection } from "./FlightsComponents/FlightHeroSection";
import { FlightsSearch } from "./FlightsComponents/FlightsSearch";
import { FlightCard } from "./FlightsComponents/FlightCard";
import Pagination from "./FlightsComponents/Pagination";
import { PanResponder } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const Flights = () => {
  const [groupedFlights, setGroupedFlights] = useState<{ [key: string]: Flight[] }>({});
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [openFilters, setOpenFilters] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const numColumns = 2;
  const rowsPerPage = 4;
  const itemsPerPage = numColumns * rowsPerPage;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) slideAnim.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) closeSheet();
        else
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  useEffect(() => {
    setLoading(true);
    axios
      .get<Country[]>("https://6927461426e7e41498fdb2c5.mockapi.io/countries")
      .then(({ data }) => {
        const flightsByCountry: { [key: string]: Flight[] } = {};
        data.forEach((country) => {
          const countryFlights: Flight[] = [];
          country.city.forEach((city) => {
            city.flights.forEach((flight) => {
              countryFlights.push({
                ...flight,
                country: country.name,
                city: city.name,
                image: country.image,
              });
            });
          });
          flightsByCountry[country.name] = countryFlights;
        });
        setGroupedFlights(flightsByCountry);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filterFlight = (flight: Flight) => {
    const fromMatch = !fromSearch || flight.from.toLowerCase().includes(fromSearch.toLowerCase());
    const toMatch = !toSearch || flight.to.toLowerCase().includes(toSearch.toLowerCase());
    const cityMatch = !cityFilter || flight.city === cityFilter;
    const airlineMatch = !airlineFilter || flight.airline === airlineFilter;
    const priceMatch = maxPrice === "" || flight.price <= maxPrice;
    return fromMatch && toMatch && cityMatch && airlineMatch && priceMatch;
  };

  const allFlights = Object.values(groupedFlights).flat().filter(filterFlight);
  const totalPages = Math.ceil(allFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFlights = allFlights.slice(startIndex, startIndex + itemsPerPage);

  const openSheet = () => {
    setOpenFilters(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
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
    // Animation for shake
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => openSheet());
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <FlightHeroSection />
        <FlatList
          data={currentFlights}
          renderItem={({ item }) => <FlightCard flight={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 8, marginBottom: 12 }}
          scrollEnabled={false}
        />
        <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </ScrollView>

      <Animated.View style={{ transform: [{ translateX: shakeAnim }], position: "absolute", bottom: 40, alignSelf: "center" }}>
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
        <Pressable style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.8)" }} onPress={closeSheet} />

        <Animated.View
          {...panResponder.panHandlers}
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
          <View style={{ width: 40, height: 4, backgroundColor: "#d1d5db", borderRadius: 4, alignSelf: "center", marginBottom: 12 }} />
          <FlightsSearch
            fromSearch={fromSearch}
            toSearch={toSearch}
            setFromSearch={setFromSearch}
            setToSearch={setToSearch}
            cityFilter={cityFilter}
            airlineFilter={airlineFilter}
            setCityFilter={setCityFilter}
            setAirlineFilter={setAirlineFilter}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            allCities={[...new Set(Object.values(groupedFlights).flat().map(f => f.city))]}
            allAirlines={[...new Set(Object.values(groupedFlights).flat().map(f => f.airline))]}
          />

          <Pressable
            onPress={closeSheet}
            style={{ marginTop: 12, backgroundColor: "#0ea5e9", paddingVertical: 14, borderRadius: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Show Results</Text>
          </Pressable>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default Flights;
