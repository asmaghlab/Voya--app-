import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, MapPin } from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../routes/hooks";
import { fetchCountries } from "../features/flights/flightsSlice";
import { fetchHotels } from "../features/hotels/hotelsSlice";
import { SearchResults } from "../components/home/SearchResults";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [isSearched, setIsSearched] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  
  const { countries = [], status: flightsStatus } = useAppSelector((s) => s.flights);
  const { hotels = [], status: hotelsStatus } = useAppSelector((s) => s.hotels);

  // Load data on mount
  useEffect(() => {
    if (flightsStatus === 'idle') {
      dispatch(fetchCountries());
    }
    if (hotelsStatus === 'idle') {
      dispatch(fetchHotels());
    }
  }, [dispatch, flightsStatus, hotelsStatus]);

  const handleSearch = () => {
    if (!query.trim()) {
      setIsSearched(false);
      return;
    }
    setIsSearched(true);
  };

  // Enhanced filtering with useMemo for performance
  const { filteredHotels, filteredFlights, matchedCountry, matchedCity } = useMemo(() => {
    if (!query.trim()) {
      return { 
        filteredHotels: [], 
        filteredFlights: [], 
        matchedCountry: null, 
        matchedCity: null 
      };
    }

    const searchTerm = query.toLowerCase().trim();
    let matchedCountry = null;
    let matchedCity = null;

    // Find matching country and city
    for (const country of countries) {
      if (country.name?.toLowerCase().includes(searchTerm)) {
        matchedCountry = country;
        break;
      }
      
      // Check cities
      if (country.city) {
        for (const city of country.city) {
          if (city.name?.toLowerCase().includes(searchTerm)) {
            matchedCountry = country;
            matchedCity = city;
            break;
          }
        }
      }
      
      if (matchedCountry) break;
    }

    // Filter Hotels
    const filteredHotels = hotels.filter((hotel: any) => {
      const hotelName = hotel.name?.toLowerCase() || '';
      const hotelCity = hotel.city?.toLowerCase() || '';
      const hotelCountry = hotel.country?.toLowerCase() || '';
      
      // Match by name
      if (hotelName.includes(searchTerm)) return true;
      
      // Match by city or country name
      if (hotelCity.includes(searchTerm) || hotelCountry.includes(searchTerm)) return true;
      
      // Match by countryId or cityId if country/city found
      if (matchedCountry && hotel.countryId?.toString() === matchedCountry.id?.toString()) return true;
      if (matchedCity && hotel.cityId?.toString() === matchedCity.id?.toString()) return true;
      
      return false;
    }).map((hotel: any) => {
      // Enrich hotel data with location info
      const hotelCountry = countries.find(c => c.id?.toString() === hotel.countryId?.toString());
      const hotelCity = hotelCountry?.city?.find((city: any) => 
        city.id?.toString() === hotel.cityId?.toString()
      );
      
      return {
        ...hotel,
        country: hotelCountry?.name || hotel.country || 'Unknown',
        city: hotelCity?.name || hotel.city || 'Unknown',
        location: `${hotelCity?.name || 'Unknown'}, ${hotelCountry?.name || 'Unknown'}`,
        image: hotel.images?.[0] || 'https://via.placeholder.com/300',
        price: hotel.pricePerNight || hotel.price || 0,
        rating: hotel.rating || 4.5,
      };
    });

    // Filter Flights
    const filteredFlights = (countries || []).flatMap((country: any) =>
      (country.city || []).flatMap((city: any) => 
        (city.flights || []).map((flight: any) => ({
          ...flight,
          countryName: country.name,
          cityName: city.name,
          image: country.image,
        }))
      )
    ).filter((flight: any) => {
      const airline = flight.airline?.toLowerCase() || '';
      const from = flight.from?.toLowerCase() || '';
      const to = flight.to?.toLowerCase() || '';
      const countryName = flight.countryName?.toLowerCase() || '';
      const cityName = flight.cityName?.toLowerCase() || '';
      
      return (
        airline.includes(searchTerm) ||
        from.includes(searchTerm) ||
        to.includes(searchTerm) ||
        countryName.includes(searchTerm) ||
        cityName.includes(searchTerm)
      );
    }).map((flight: any) => ({
      ...flight,
      duration: flight.duratuion || flight.duration || 'N/A',
      passenger: flight.passanger || flight.passenger || 1,
    }));

    return { 
      filteredHotels, 
      filteredFlights, 
      matchedCountry, 
      matchedCity 
    };
  }, [query, hotels, countries]);

  const isLoading = flightsStatus === 'loading' || hotelsStatus === 'loading';
  const hasError = flightsStatus === 'failed' || hotelsStatus === 'failed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MapPin size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hotels, flights ..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={handleSearch} style={styles.searchButton}>
          <Search size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ Failed to load data</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => {
              dispatch(fetchCountries());
              dispatch(fetchHotels());
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        /* Results */
        <SearchResults
          hotels={filteredHotels}
          flights={filteredFlights}
          country={matchedCountry}
          city={matchedCity}
          isSearched={isSearched}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backText: {
    fontSize: 16,
    color: "#0ea5e9",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1f2937",
  },
  searchButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 20,
    padding: 10,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});