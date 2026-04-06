import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  Hotel as HotelIcon,
  Plane,
  MapPin,
  Star,
  Filter,
  Search as SearchIcon,
} from "lucide-react-native";
import { useState } from "react";
import { HotelCard } from "./HotelCard";
import { FlightCard } from "./FlightCard";

interface SearchResultsProps {
  hotels: any[];
  flights: any[];
  country?: any;
  city?: any;
  isSearched: boolean;
}

export const SearchResults = ({
  hotels,
  flights,
  country,
  city,
  isSearched,
}: SearchResultsProps) => {
  const [tab, setTab] = useState<"hotels" | "flights">("hotels");

  // Empty state before search
  if (!isSearched) {
    return (
      <ScrollView contentContainerStyle={styles.emptyContainer}>
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <SearchIcon size={48} color="#0ea5e9" />
          </View>
          <Text style={styles.emptySub}>
            Search for destinations, hotels, or flights to start exploring
          </Text>
        </View>
      </ScrollView>
    );
  }
  // No results state
  if (hotels.length === 0 && flights.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.emptyContainer}>
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Filter size={48} color="#f97316" />
          </View>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySub}>
            We couldn't find any matches for your search
          </Text>
          
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Try:</Text>
            <Text style={styles.tip}>• Checking your spelling</Text>
            <Text style={styles.tip}>• Using different keywords</Text>
            <Text style={styles.tip}>• Searching for popular destinations</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Switch to flights tab if no hotels found
  if (hotels.length === 0 && flights.length > 0 && tab === "hotels") {
    setTimeout(() => setTab("flights"), 0);
  }

  // Switch to hotels tab if no flights found
  if (flights.length === 0 && hotels.length > 0 && tab === "flights") {
    setTimeout(() => setTab("hotels"), 0);
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Country Header */}
      {country && (
        <View style={styles.countryCard}>
          {country.image && (
            <Image source={{ uri: country.image }} style={styles.countryImg} />
          )}

          <View style={styles.countryContent}>
            <View style={styles.row}>
              <Text style={styles.countryName}>{country.name}</Text>
              {country.rating && (
                <View style={styles.badge}>
                  <Star size={12} color="#fff" fill="#fff" />
                  <Text style={styles.badgeText}>{country.rating}</Text>
                </View>
              )}
            </View>

            {city && (
              <View style={styles.outlineBadge}>
                <MapPin size={12} color="#0ea5e9" />
                <Text style={styles.cityText}>{city.name}</Text>
              </View>
            )}

            {country.cun_des && (
              <Text style={styles.desc} numberOfLines={3}>
                {country.cun_des}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Found {hotels.length + flights.length} results
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            tab === "hotels" && styles.activeTab,
            hotels.length === 0 && styles.disabledTab,
          ]}
          onPress={() => hotels.length > 0 && setTab("hotels")}
          disabled={hotels.length === 0}
        >
          <HotelIcon 
            size={18} 
            color={tab === "hotels" ? "#0ea5e9" : hotels.length === 0 ? "#ccc" : "#666"} 
          />
          <Text style={[
            styles.tabText,
            tab === "hotels" && styles.activeTabText,
            hotels.length === 0 && styles.disabledTabText,
          ]}>
            Hotels ({hotels.length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            tab === "flights" && styles.activeTab,
            flights.length === 0 && styles.disabledTab,
          ]}
          onPress={() => flights.length > 0 && setTab("flights")}
          disabled={flights.length === 0}
        >
          <Plane 
            size={18} 
            color={tab === "flights" ? "#0ea5e9" : flights.length === 0 ? "#ccc" : "#666"} 
          />
          <Text style={[
            styles.tabText,
            tab === "flights" && styles.activeTabText,
            flights.length === 0 && styles.disabledTabText,
          ]}>
            Flights ({flights.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.resultsContainer}>
        {tab === "hotels" ? (
          hotels.map((item) => (
            <HotelCard key={`hotel-${item.id}`} hotel={item} />
          ))
        ) : (
          flights.map((item) => (
            <FlightCard key={`flight-${item.id}`} flight={item} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // Empty states
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  emptyBox: {
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { 
    fontSize: 24, 
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: { 
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  tipsBox: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginTop: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    color: "#4b5563",
    marginVertical: 4,
    lineHeight: 20,
  },

  // Country card
  countryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryImg: { 
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  countryContent: { padding: 16 },
  row: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  countryName: { 
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    backgroundColor: "#f97316",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
  },
  badgeText: { 
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  outlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  cityText: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "500",
  },
  desc: { 
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 20,
  },

  // Summary
  summaryBox: {
    padding: 12,
    backgroundColor: "#e0f2fe",
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: "#0369a1",
    fontWeight: "600",
    textAlign: "center",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0ea5e9",
  },
  disabledTab: {
    opacity: 0.5,
    backgroundColor: "#f9fafb",
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#0ea5e9",
    fontWeight: "700",
  },
  disabledTabText: {
    color: "#ccc",
  },

  // List
  resultsContainer: {
    paddingBottom: 20,
  },
});