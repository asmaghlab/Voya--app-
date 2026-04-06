import React from "react";
import { 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  StatusBar 
} from "react-native";

import { Header } from "../components/home/Header";
import { DestinationsSection } from "../components/home/DestinationsSection";
import { HotelsSection } from "../components/home/HotelsSection";
import { FlightsSection } from "../components/home/FlightsSection";
import { SpecialDealsSection } from "../components/home/SpecialDealsSection";
import { NewsletterSection } from "../components/home/NewsletterSection";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import TravelAIChatbot from "./Chat/Chat";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <Header />

      {/* Main Content with Scroll */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={true}
      >
        <DestinationsSection />
        <HotelsSection />
        <FlightsSection />
        <SpecialDealsSection />
        <NewsletterSection />
        <TestimonialsSection />
        <TravelAIChatbot />
        {/* Footer Spacing */}
        <SafeAreaView style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 50, // Extra space at bottom
  },
  footerSpacing: {
    height: 80, // Ensures last content is reachable
  },
});

export default HomeScreen;