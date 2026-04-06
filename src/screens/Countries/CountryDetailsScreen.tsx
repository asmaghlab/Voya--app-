import React, { useEffect } from 'react';
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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../routes/store';
import { fetchCountryById, clearSelectedCountry } from '../../features/countries/countriesSlice';
import { Country, City, Flight } from '../../types/country';
import { ArrowLeft, Plane, Hotel, MapPin, Clock, Star } from 'lucide-react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';

type RootStackParamList = {
  CountryDetails: { id: string };
  Flights: { screen: string; params: { id: string } };
  Hotels: { countryId: string };
  FlightDetails: { id: string };
};

type CountryDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CountryDetails'>;
type CountryDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CountryDetails'>;

const { width, height } = Dimensions.get('window');

const CountryDetailsScreen = () => {
  const route = useRoute<CountryDetailsScreenRouteProp>();
  const navigation = useNavigation<CountryDetailsScreenNavigationProp>();
  
  const { id } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCountry, loading } = useSelector((state: RootState) => state.countries);

  useEffect(() => {
    if (id) {
      dispatch(fetchCountryById(id));
    }
    return () => {
      dispatch(clearSelectedCountry());
    };
  }, [dispatch, id]);

  if (loading) return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color="#00A6E8" />
    </View>
  );

  if (!selectedCountry) return null;

  const country: Country = selectedCountry;

  const handleFlightPress = (flightId: string) => {
    navigation.navigate('Flights', {
      screen: 'FlightDetails',
      params: { id: flightId }
    });
  };

  const handleHotelsPress = () => {
    navigation.navigate('Hotels', { countryId: country.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Image with curved bottom */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: country.image }}
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
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{country.rating || '4.8'}</Text>
          </View>
        </View>

        {/* Country Name */}
        <View style={styles.titleContainer}>
          <Text style={styles.countryName}>{country.name}</Text>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* About Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About {country.name}</Text>
            <Text style={styles.cardDescription}>{country.cun_des}</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleHotelsPress}
            >
              <Hotel size={22} color="#00A6E8" />
              <Text style={styles.actionText}>Hotels</Text>
            </TouchableOpacity>
          </View>

          {/* Cities & Flights */}
          {country.city?.map((city: City) => (
            <View key={city.id} style={styles.cityCard}>
              <View style={styles.cityHeader}>
                <MapPin size={20} color="#00A6E8" />
                <Text style={styles.cityName}>{city.name}</Text>
              </View>
              <Text style={styles.cityDescription}>{city.des}</Text>

              {city.flights?.map((flight: Flight) => (
                <TouchableOpacity 
                  key={flight.id}
                  style={styles.flightCard}
                  onPress={() => handleFlightPress(flight.id)}
                >
                  <View style={styles.flightHeader}>
                    <View style={styles.airlineInfo}>
                      <Plane size={18} color="#00A6E8" />
                      <Text style={styles.airlineName}>{flight.airline}</Text>
                    </View>
                    <Text style={styles.price}>${flight.price}</Text>
                  </View>

                  <View style={styles.routeRow}>
                    <View style={styles.location}>
                      <Text style={styles.locationCode}>{flight.from.split(' ')[0]}</Text>
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
                      <Text style={styles.locationCode}>{flight.to.split(' ')[0]}</Text>
                      <Text style={styles.locationName}>{flight.to}</Text>
                    </View>
                  </View>

                  {flight.offer && (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerText}>{flight.offer}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{country.city?.length || 0}</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {country.city?.reduce((acc, city) => acc + (city.flights?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Flights</Text>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
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
    bottom: 80, // رفعت شوية عشان الـ wave
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

  // City Card
  cityCard: {
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
    marginBottom: 12,
  },

  // Flight Card
  flightCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  airlineName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00A6E8',
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
});

export default CountryDetailsScreen;