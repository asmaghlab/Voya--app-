import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 
import { Country } from '../../types/country';

interface CountryCardProps {
  country: Country;
  index: number;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const CountryCard = ({ country, index, onPress }: CountryCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, { marginBottom: 16 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: country.image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>📍 Explore</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {country.name}
          </Text>
        </View>

       
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: cardWidth * 1.3,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CountryCard;