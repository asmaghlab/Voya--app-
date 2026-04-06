import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onboardingStyles } from "../../styles/onboardingStyle";

type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type OnboardingScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

const onboardingData = [
  {
    key: "1",
    title: "Search flights",
    subtitle: "Search and compare prices for flights around the world.",
    image: require("../../assets/welcome/Hotel Booking-rafiki (1).png"),
  },
  {
    key: "2",
    title: "Booking",
    subtitle: "Book a flight through simple steps and pay securely.",
    image: require("../../assets/welcome/Hotel Booking-cuate.png"),
  },
  {
    key: "3",
    title: "Get price alert",
    subtitle: "Save your search and get notifications when prices change.",
    image: require("../../assets/welcome/Push notifications-rafiki.png"),
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenProp>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  
  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.navigate("Welcome");
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => (
    <View style={onboardingStyles.page}>
      <Image
        source={item.image}
        style={onboardingStyles.illustration}
        resizeMode="contain"
      />
      <Text style={onboardingStyles.title}>{item.title}</Text>
      <Text style={onboardingStyles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={onboardingStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.key}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        ref={flatListRef}
      />

      <View style={onboardingStyles.navigationContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={onboardingStyles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={onboardingStyles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                onboardingStyles.dot,
                currentIndex === index && onboardingStyles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={onboardingStyles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={onboardingStyles.nextIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
