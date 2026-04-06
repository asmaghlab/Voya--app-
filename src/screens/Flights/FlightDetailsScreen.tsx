import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import axios from "axios";
import FlightBookingScreen from "./FlightBookingScreen";
import { ArrowLeft, Plane, Clock, MapPin } from "lucide-react-native";
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get("window");

interface FlightAPI {
  id: string;
  airline: string;
  from: string;
  to: string;
  duratuion: string;
  passanger: number;
  offer?: string;
  des?: string;
  price?: number;
}

interface CityAPI {
  id: string;
  name: string;
  flights: FlightAPI[];
}

interface CountryAPI {
  name: string;
  image: string;
  city: CityAPI[];
}

interface FlightDetails extends FlightAPI {
  country: string;
  city: string;
  image: string;
}

interface FlightDetailsScreenProps {
  route: any;
  navigation: any;
}

const FlightDetailsScreen = ({
  route,
  navigation,
}: FlightDetailsScreenProps) => {
  const flightId = route.params?.flightId || route.params?.id;
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (!flightId) {
      setLoading(false);
      return;
    }

    axios
      .get<CountryAPI[]>(
        "https://6927461426e7e41498fdb2c5.mockapi.io/countries"
      )
      .then(({ data }) => {
        let foundFlight: FlightDetails | null = null;

        data.forEach((country) => {
          country.city.forEach((city) => {
            city.flights.forEach((f) => {
              const fIdStr = String(f.id);
              const flightIdStr = String(flightId);

              if (f.id === flightId || fIdStr === flightIdStr) {
                foundFlight = {
                  ...f,
                  country: country.name,
                  city: city.name,
                  image: country.image,
                };
              }
            });
          });
        });

        setFlight(foundFlight);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Error:', error);
        setLoading(false);
      });
  }, [flightId]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#00A6E8" />
      </View>
    );
  }

  if (!flight) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorTitle}>Flight Not Found</Text>
        <Text style={styles.errorText}>
          The flight you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Image with curved bottom */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: flight.image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Curved SVG Wave */}
        <View style={styles.waveContainer}>
          <Svg
            width={width}
            height={80}
            viewBox={`0 0 ${width} 80`}
            style={styles.wave}
          >
            <Path
              d={`M0,40 Q${width/4},0 ${width/2},40 T${width},40 L${width},80 L0,80 Z`}
              fill="#FFF"
            />
          </Svg>
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.ratingBadge}>
            <Plane size={16} color="#FFD700" />
            <Text style={styles.ratingText}>Flight</Text>
          </View>
        </View>

        {/* Flight Name */}
        <View style={styles.titleContainer}>
          <Text style={styles.countryName}>{flight.airline}</Text>
          <Text style={styles.countryTagline}>{flight.from} → {flight.to}</Text>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* About Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Flight Details</Text>
            <Text style={styles.cardDescription}>
              {flight.des || `Direct flight operated by ${flight.airline} from ${flight.from} to ${flight.to}.`}
            </Text>
          </View>
          {/* Flight Route */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flight Route</Text>
            
            <View style={styles.cityCard}>
              <View style={styles.routeRow}>
                <View style={styles.location}>
                  <Text style={styles.locationCode}>
                    {flight.from.split(' ')[0]}
                  </Text>
                  <Text style={styles.locationName}>{flight.from}</Text>
                </View>

                <View style={styles.routeCenter}>
                  <View style={styles.durationRow}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.duration}>{flight.duratuion}</Text>
                  </View>
                  <View style={styles.flightLine}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                    <Plane size={12} color="#00A6E8" />
                    <View style={styles.line} />
                    <View style={styles.dot} />
                  </View>
                  <Text style={styles.directText}>Direct</Text>
                </View>

                <View style={styles.location}>
                  <Text style={styles.locationCode}>
                    {flight.to.split(' ')[0]}
                  </Text>
                  <Text style={styles.locationName}>{flight.to}</Text>
                </View>
              </View>

              {flight.offer && (
                <View style={styles.offerBadge}>
                  <Text style={styles.offerText}>{flight.offer}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Destination Info */}
          <View style={styles.destinationCard}>
            <View style={styles.cityHeader}>
              <MapPin size={20} color="#00A6E8" />
              <Text style={styles.cityName}>{flight.city}, {flight.country}</Text>
            </View>
            <Text style={styles.cityDescription}>
              Your destination awaits with amazing experiences and adventures
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flight.passanger || 0}</Text>
              <Text style={styles.statLabel}>Passengers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{flight.duratuion}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => setShowBookingForm(true)}
          >
            <Text style={styles.bookButtonText}>Book This Flight</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      <FlightBookingScreen
  visible={showBookingForm}
  onClose={() => setShowBookingForm(false)}
  flight={flight}  // ← هنا بنمرر الـ flight اللي موجود في state
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  
  loadingScreen: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF' 
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  errorButton: {
    backgroundColor: '#00A6E8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Image Container
  imageContainer: { 
    width: '100%', 
    height: height * 0.4,
    position: 'relative',
    overflow: 'hidden',
  },
  
  image: { 
    width: '100%', 
    height: '100%' 
  },
  
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // Wave Container
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  
  wave: {
    position: 'absolute',
    bottom: 0,
  },

  // Header
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  ratingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Title
  titleContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  
  countryName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  
  countryTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  // Scroll content
  contentScroll: {
    flex: 1,
    marginTop: 0,
  },
  
  contentWrapper: {
    backgroundColor: '#FFF',
    paddingTop: 20,
    minHeight: height * 0.6,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    width: 100,
  },
  
  actionText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  // City Card
  cityCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  location: {
    flex: 1,
  },
  
  locationCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  
  locationName: {
    fontSize: 12,
    color: '#666',
  },
  
  routeCenter: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  duration: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A6E8',
  },
  
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 2,
  },
  
  directText: {
    fontSize: 11,
    color: '#00A6E8',
    fontWeight: '600',
  },
  
  offerBadge: {
    backgroundColor: '#FF6B6B',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  offerText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },

  // Destination Card
  destinationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  cityName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  
  cityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00A6E8',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDD',
  },

  // Book Button
  bookButton: {
    backgroundColor: '#00A6E8',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlightDetailsScreen;