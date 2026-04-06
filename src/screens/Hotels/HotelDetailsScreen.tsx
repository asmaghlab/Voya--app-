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
  Linking,
} from "react-native";
import axios from "axios";
import { ArrowLeft, MapPin, Star, DollarSign, Wifi, Coffee, Car, Phone, Mail, Navigation } from "lucide-react-native";
import Svg, { Path } from 'react-native-svg';
import MapView, { Marker } from 'react-native-maps';
import {HotelBookingModal} from "./HotelBookingScreen";

const { width, height } = Dimensions.get("window");

interface HotelAPIResponse {
  id: string;
  name: string;
  description: string;
  stars: number;
  pricePerNight: number;
  location?: string | {
    lat?: number;
    lng?: number;
    formattedAddress?: string;
    address?: string;
  };
  amenities?: string[];
  images?: string[];
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface HotelDetailsScreenProps {
  route: any;
  navigation: any;
}

const HotelDetailsScreen = ({
  route,
  navigation,
}: HotelDetailsScreenProps) => {
  const hotelId = route.params?.id;
  const {  hotelName } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  const [showBooking, setShowBooking] = useState(false);
  const [hotel, setHotel] = useState<HotelAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    axios
      .get<HotelAPIResponse>(`https://6934ceba4090fe3bf020c412.mockapi.io/api/v1/hotels/${hotelId}`)
      .then(({ data }) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Error:', error);
        setLoading(false);
      });
  }, [hotelId]);

  const getLocationString = () => {
    if (!hotel?.location) return "Location not available";
    
    if (typeof hotel.location === 'string') {
      return hotel.location;
    } else if (typeof hotel.location === 'object') {
      return hotel.location.formattedAddress || 
             hotel.location.address || 
             "Location available";
    }
    
    return "Location not available";
  };

  const getLocationCoordinates = () => {
    if (!hotel?.location || typeof hotel.location === 'string') {
      return {
        latitude: 30.0444,
        longitude: 31.2357,
      };
    }

    return {
      latitude: hotel.location.lat || 30.0444,
      longitude: hotel.location.lng || 31.2357,
    };
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('wi-fi')) 
      return <Wifi size={20} color="#00A6E8" />;
    if (lowerAmenity.includes('coffee') || lowerAmenity.includes('breakfast') || lowerAmenity.includes('restaurant')) 
      return <Coffee size={20} color="#00A6E8" />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car') || lowerAmenity.includes('valet')) 
      return <Car size={20} color="#00A6E8" />;
    return <Star size={20} color="#00A6E8" />;
  };

  const openGoogleMaps = () => {
    const coords = getLocationCoordinates();
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  const makePhoneCall = () => {
    if (hotel?.phone) {
      Linking.openURL(`tel:${hotel.phone}`).catch(err => console.error('Error making call:', err));
    }
  };

  const sendEmail = () => {
    if (hotel?.email) {
      Linking.openURL(`mailto:${hotel.email}`).catch(err => console.error('Error sending email:', err));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#00A6E8" />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorTitle}>Hotel Not Found</Text>
        <Text style={styles.errorText}>
          The hotel you're looking for doesn't exist.
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

  const mainImage = hotel.images?.[selectedImage] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800';
  const coordinates = getLocationCoordinates();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Image with curved bottom */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImage }}
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
            <Star size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{hotel.stars} Stars</Text>
          </View>
        </View>

        {/* Hotel Name */}
        <View style={styles.titleContainer}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.hotelLocation}>
            <MapPin size={16} color="#FFF" /> {hotel.city || "Unknown City"}, {hotel.country || "Unknown Country"}
          </Text>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Price Card */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Price per night</Text>
                <Text style={styles.priceIncludes}>All taxes included</Text>
              </View>
              <View style={styles.priceAmountContainer}>
                <DollarSign size={20} color="#00A6E8" />
                <Text style={styles.priceAmount}>{hotel.pricePerNight}</Text>
              </View>
            </View>
          </View>

          {/* About Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About the Hotel</Text>
            <Text style={styles.cardDescription}>
              {hotel.description || `Luxury ${hotel.stars}-star hotel offering premium amenities and exceptional service.`}
            </Text>
          </View>

          {/* Image Gallery */}
          {hotel.images && hotel.images.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
              >
                {hotel.images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImage(index)}
                    style={[
                      styles.galleryImageContainer,
                      selectedImage === index && styles.selectedImageContainer
                    ]}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {hotel.amenities.slice(0, 6).map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <View style={styles.amenityIcon}>
                      {getAmenityIcon(amenity)}
                    </View>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location Map */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={coordinates}
                  title={hotel.name}
                  description={getLocationString()}
                >
                  <View style={styles.markerContainer}>
                    <MapPin size={24} color="#00A6E8" />
                  </View>
                </Marker>
              </MapView>
              
              <TouchableOpacity 
                style={styles.mapOverlayButton} 
                onPress={openGoogleMaps}
              >
                <Navigation size={20} color="#FFF" />
                <Text style={styles.mapButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.locationText}>{getLocationString()}</Text>
          </View>

          {/* Contact Information */}
          {(hotel.phone || hotel.email) && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactButtons}>
                {hotel.phone && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={makePhoneCall}
                  >
                    <Phone size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
                
                {hotel.email && (
                  <TouchableOpacity 
                    style={[styles.contactButton, styles.emailButton]}
                    onPress={sendEmail}
                  >
                    <Mail size={20} color="#FFF" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Star size={24} color="#00A6E8" />
              <Text style={styles.statNumber}>{hotel.stars}</Text>
              <Text style={styles.statLabel}>Star Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <DollarSign size={24} color="#00A6E8" />
              <Text style={styles.statNumber}>${hotel.pricePerNight}</Text>
              <Text style={styles.statLabel}>Per Night</Text>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity
        style={styles.bookButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.bookButtonText}>Book This Hotel</Text>
      </TouchableOpacity>

      {/* Booking Modal */}
      <HotelBookingModal
        hotelId={hotel.id}
        hotelName={hotel.name}
        pricePerNight={hotel.pricePerNight}
        modalVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          alert('Booking successful!');
        }}
      />

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
  
  hotelName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  
  hotelLocation: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  // Price Card
  priceCard: {
    backgroundColor: '#00A6E8',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  priceInfo: {
    flex: 1,
  },
  
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  
  priceIncludes: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  
  priceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 4,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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

  // Gallery
  galleryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  
  galleryImageContainer: {
    width: 100,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  selectedImageContainer: {
    borderColor: '#00A6E8',
  },
  
  galleryImage: {
    width: '100%',
    height: '100%',
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: width * 0.4,
  },
  
  amenityIcon: {
    marginRight: 8,
  },
  
  amenityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Map
  mapContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  markerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  mapOverlayButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#00A6E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    elevation: 3,
  },
  
  mapButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  locationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Contact Section
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A6E8',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  
  emailButton: {
    backgroundColor: '#10B981',
  },
  
  contactButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
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
    marginTop: 8,
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
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#00A6E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HotelDetailsScreen;