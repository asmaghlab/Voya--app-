import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeroSectionProps {
  header?: string;
  title: string;
  description: string;
}

const HeroSection = ({ header, title, description }: HeroSectionProps) => {
  return (
    <LinearGradient
      colors={['#f9fafb', '#f3f4f6', '#f9fafb']}
      style={styles.container}
    >
      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <View style={styles.content}>
    
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    opacity: 0.6,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(219, 234, 254, 0.3)',
    opacity: 0.6,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#3b82f6',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});

export default HeroSection;