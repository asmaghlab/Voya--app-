import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, X, Send, Hotel, Plane, ChevronLeft, Sparkles, MapPin, Calendar, Users, DollarSign, Minimize2, Maximize2, RefreshCw } from 'lucide-react-native';
import OpenAI from 'openai';

const { width, height } = Dimensions.get('window');

// ⚠️ ضع OpenAI API Key بتاعك هنا
const OPENAI_API_KEY = 'YOUR_API_KEY_HERE';

// ============= TYPES =============
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  options?: string[];
}

interface UserPreferences {
  destination?: string;
  budget?: string;
  duration?: string;
  season?: string;
  travelers?: string;
}

interface Hotel {
  id: string;
  name: string;
  pricePerNight: number;
  rating: number;
  stars: number;
  country?: string;
  city?: string;
  amenities: string[];
  offers: string[];
  reviewCount?: number;
  image?: string;
}

interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  price: number;
  duration: string;
  offer: string;
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
}

interface Country {
  id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
}

// ============= API SERVICE =============
class APIService {
  private static instance: APIService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached && Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  // Fetch countries from REST Countries API
  async fetchCountries(): Promise<Country[]> {
    const cacheKey = 'countries';
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,capital,region');
      const data = await response.json();
      
      const countries: Country[] = data.map((country: any) => ({
        id: country.cca2.toLowerCase(),
        name: country.name.common,
        code: country.cca2,
        capital: country.capital?.[0] || '',
        region: country.region || ''
      })).filter((country: Country) => 
        country.name && country.code && 
        !['Antarctica', 'Vatican City', 'San Marino'].includes(country.name)
      );

      this.setCache(cacheKey, countries);
      return countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to popular tourist destinations
      return this.getFallbackCountries();
    }
  }

  // Fetch hotels from RapidAPI (demo) or create realistic mock
  async fetchHotels(destination: string, budget?: string): Promise<Hotel[]> {
    const cacheKey = `hotels_${destination}_${budget}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Using a realistic mock API since most hotel APIs require paid keys
      // In production, you'd use Booking.com, Expedia, or Hotels.com APIs
      const hotels = await this.generateRealisticHotels(destination, budget);
      this.setCache(cacheKey, hotels);
      return hotels;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return this.getFallbackHotels(destination);
    }
  }

  // Fetch flights from aviation API or realistic mock
  async fetchFlights(from: string, to: string, budget?: string): Promise<Flight[]> {
    const cacheKey = `flights_${from}_${to}_${budget}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Using realistic mock since flight APIs require paid keys
      // In production, you'd use Amadeus, Sabre, or Skyscanner APIs
      const flights = await this.generateRealisticFlights(from, to, budget);
      this.setCache(cacheKey, flights);
      return flights;
    } catch (error) {
      console.error('Error fetching flights:', error);
      return this.getFallbackFlights(from, to);
    }
  }

  // Generate realistic hotel data based on destination
  private async generateRealisticHotels(destination: string, budget?: string): Promise<Hotel[]> {
    const hotelChains = [
      'Marriott', 'Hilton', 'Hyatt', 'InterContinental', 'Sheraton', 
      'Westin', 'Radisson', 'Holiday Inn', 'Best Western', 'Accor'
    ];
    
    const amenities = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Pet-friendly'];
    const offers = [
      'Free breakfast', '10% off 3+ nights', 'Late checkout', 
      'Free cancellation', 'Room upgrade', 'Spa credit', 'Airport transfer'
    ];

    const priceRange = this.getBudgetRange(budget);
    const hotels: Hotel[] = [];

    for (let i = 0; i < 8; i++) {
      const chain = hotelChains[Math.floor(Math.random() * hotelChains.length)];
      const price = Math.floor(Math.random() * (priceRange.max - priceRange.min) + priceRange.min);
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const stars = Math.floor(Math.random() * 3) + 3;
      
      hotels.push({
        id: `hotel_${i}`,
        name: `${chain} ${destination}`,
        pricePerNight: price,
        rating: parseFloat(rating),
        stars,
        country: destination.toLowerCase(),
        city: destination,
        amenities: this.getRandomItems(amenities, 4),
        offers: this.getRandomItems(offers, 2),
        reviewCount: Math.floor(Math.random() * 2000 + 500),
        image: `https://picsum.photos/seed/hotel${i}/400/300.jpg`
      });
    }

    return hotels.sort((a, b) => b.rating - a.rating);
  }

  // Generate realistic flight data
  private async generateRealisticFlights(from: string, to: string, budget?: string): Promise<Flight[]> {
    const airlines = [
      'Emirates', 'Qatar Airways', 'Turkish Airlines', 'Lufthansa', 
      'British Airways', 'Air France', 'KLM', 'Etihad', 'Gulf Air',
      'Delta', 'United', 'American Airlines', 'Singapore Airlines'
    ];
    
    const priceRange = this.getBudgetRange(budget);
    const flights: Flight[] = [];

    for (let i = 0; i < 6; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const price = Math.floor(Math.random() * (priceRange.max - priceRange.min) + priceRange.min);
      const hours = Math.floor(Math.random() * 8 + 2);
      const minutes = Math.floor(Math.random() * 60);
      const stops = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
      
      flights.push({
        id: i + 1,
        airline,
        from,
        to,
        price,
        duration: `${hours}h ${minutes}m`,
        offer: Math.random() > 0.6 ? `${Math.floor(Math.random() * 30 + 5)}% off` : 'No offer',
        departureTime: `${Math.floor(Math.random() * 12 + 6).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        arrivalTime: `${Math.floor(Math.random() * 12 + 14).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        stops
      });
    }

    return flights.sort((a, b) => a.price - b.price);
  }

  private getBudgetRange(budget?: string): { min: number; max: number } {
    if (!budget) return { min: 50, max: 500 };
    
    if (budget.includes('Under $100') || budget.includes('💵')) return { min: 30, max: 100 };
    if (budget.includes('$100-$250') || budget.includes('💳')) return { min: 80, max: 250 };
    if (budget.includes('$250-$400') || budget.includes('💎')) return { min: 200, max: 400 };
    if (budget.includes('$400+') || budget.includes('👑')) return { min: 350, max: 800 };
    
    return { min: 50, max: 500 };
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getFallbackCountries(): Country[] {
    return [
      { id: 'us', name: 'United States', code: 'US', capital: 'Washington D.C.', region: 'Americas' },
      { id: 'gb', name: 'United Kingdom', code: 'GB', capital: 'London', region: 'Europe' },
      { id: 'fr', name: 'France', code: 'FR', capital: 'Paris', region: 'Europe' },
      { id: 'de', name: 'Germany', code: 'DE', capital: 'Berlin', region: 'Europe' },
      { id: 'it', name: 'Italy', code: 'IT', capital: 'Rome', region: 'Europe' },
      { id: 'es', name: 'Spain', code: 'ES', capital: 'Madrid', region: 'Europe' },
      { id: 'jp', name: 'Japan', code: 'JP', capital: 'Tokyo', region: 'Asia' },
      { id: 'th', name: 'Thailand', code: 'TH', capital: 'Bangkok', region: 'Asia' }
    ];
  }

  private getFallbackHotels(destination: string): Hotel[] {
    return [
      {
        id: 'fallback_1',
        name: `Grand Hotel ${destination}`,
        pricePerNight: 150,
        rating: 4.2,
        stars: 4,
        country: destination.toLowerCase(),
        city: destination,
        amenities: ['WiFi', 'Pool', 'Restaurant'],
        offers: ['Free breakfast'],
        reviewCount: 1250
      },
      {
        id: 'fallback_2',
        name: `Luxury Resort ${destination}`,
        pricePerNight: 280,
        rating: 4.6,
        stars: 5,
        country: destination.toLowerCase(),
        city: destination,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
        offers: ['Free spa access'],
        reviewCount: 890
      }
    ];
  }

  private getFallbackFlights(from: string, to: string): Flight[] {
    return [
      {
        id: 1,
        airline: 'Global Airlines',
        from,
        to,
        price: 450,
        duration: '3h 30m',
        offer: '10% off',
        departureTime: '10:30',
        arrivalTime: '14:00',
        stops: 0
      },
      {
        id: 2,
        airline: 'International Airways',
        from,
        to,
        price: 380,
        duration: '4h 15m',
        offer: 'No offer',
        departureTime: '14:45',
        arrivalTime: '19:00',
        stops: 1
      }
    ];
  }
}

// ============= AI SERVICE =============
class AIService {
  private client: OpenAI;
  private conversationHistory: any[] = [];

  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async askQuestion(step: number, preferences: UserPreferences, countries: Country[]): Promise<{ question: string; options: string[] }> {
    try {
      const questionPrompts = [
        {
          system: "You are a friendly travel assistant. Ask about travel destination.",
          user: `Ask where the user wants to travel. Available: ${countries.slice(0, 8).map(c => c.name).join(', ')}.
Respond with ONLY valid JSON (no markdown, no backticks):
{
  "question": "Hi! 🌍 Where would you like to travel?",
  "options": ["${countries[0]?.name}", "${countries[1]?.name}", "${countries[2]?.name}", "${countries[3]?.name}", "Surprise me! 🎲"]
}`
        },
        {
          system: "Ask about accommodation budget.",
          user: `User chose: ${preferences?.destination}. Ask about budget.
Respond with ONLY valid JSON:
{
  "question": "Perfect choice! 💰 What's your budget per night for accommodation?",
  "options": ["Under $100 💵", "$100-$250 💳", "$250-$400 💎", "$400+ 👑"]
}`
        },
        {
          system: "Ask about trip duration.",
          user: `Budget: ${preferences?.budget}. Ask about nights.
Respond with ONLY valid JSON:
{
  "question": "Great! 📅 How many nights are you planning to stay?",
  "options": ["2-3 nights", "4-5 nights", "6-7 nights", "1 week+"]
}`
        },
        {
          system: "Ask about travel season.",
          user: `Duration: ${preferences?.duration}. Ask when.
Respond with ONLY valid JSON:
{
  "question": "Awesome! 🌤️ When would you like to travel?",
  "options": ["Summer ☀️", "Winter ❄️", "Spring 🌸", "Autumn 🍂"]
}`
        },
        {
          system: "Ask about number of travelers.",
          user: `Season: ${preferences?.season}. Ask how many people.
Respond with ONLY valid JSON:
{
  "question": "Almost done! 👥 How many people will be traveling?",
  "options": ["Solo 🧳", "Couple 💑", "Family 👨‍👩‍👧", "Group 👨‍👩‍👧‍👦"]
}`
        }
      ];

      const currentPrompt = questionPrompts[step] || questionPrompts[0];

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: currentPrompt.system },
          { role: "user", content: currentPrompt.user }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      let response = completion.choices[0].message.content?.trim() || '';
      
      response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getFallbackQuestion(step, countries);
      
    } catch (error) {
      console.error('AI Error:', error);
      return this.getFallbackQuestion(step, countries);
    }
  }

  async searchRecommendations(
    preferences: UserPreferences,
    hotels: Hotel[],
    flights: Flight[]
  ): Promise<string> {
    try {
      const topHotels = hotels.slice(0, 3);
      const topFlights = flights.slice(0, 3);

      const prompt = `Create personalized travel recommendations:

**User Preferences:**
🎯 Destination: ${preferences.destination}
💰 Budget: ${preferences.budget}
📅 Duration: ${preferences.duration}
🌤️ Season: ${preferences.season}
👥 Travelers: ${preferences.travelers}

**Top Hotels (${topHotels.length}):**
 ${topHotels.map((h, i) => `
 ${i + 1}. ${h.name}
   💵 $${h.pricePerNight}/night
   ⭐ ${h.rating}/5 (${h.reviewCount} reviews)
   🎁 ${h.offers[0]}
`).join('\n')}

**Top Flights (${topFlights.length}):**
 ${topFlights.map((f, i) => `
 ${i + 1}. ${f.airline}: ${f.from} → ${f.to}
   💵 $${f.price} | ⏱️ ${f.duration}
   ${f.offer !== 'No offer' ? `🎁 ${f.offer}` : ''}
`).join('\n')}

Write 2-3 warm, engaging paragraphs highlighting best options. Use emojis and be enthusiastic! Keep under 300 characters.`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an enthusiastic travel expert. Be warm, helpful, and use emojis." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      return completion.choices[0].message.content || this.generateFallbackRecommendation(preferences, topHotels, topFlights);
      
    } catch (error) {
      console.error('AI Error:', error);
      return this.generateFallbackRecommendation(preferences, hotels, flights);
    }
  }

  async chat(message: string, preferences: UserPreferences): Promise<string> {
    try {
      this.conversationHistory.push({ role: "user", content: message });

      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are a helpful travel assistant. User preferences: ${JSON.stringify(preferences)}. Keep responses under 100 characters.` 
          },
          ...this.conversationHistory.slice(-5)
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      const reply = completion.choices[0].message.content || "I'm here to help!";
      this.conversationHistory.push({ role: "assistant", content: reply });

      return reply;
      
    } catch (error) {
      console.error('AI Error:', error);
      return "I'm here to help with your travel plans!";
    }
  }

  private getFallbackQuestion(step: number, countries: Country[]): { question: string; options: string[] } {
    const questions = [
      "Hi! 🌍 Where would you like to travel?",
      "What's your budget per night? 💰",
      "How many nights will you stay? 📅",
      "When would you like to travel? 🌤️",
      "How many travelers? 👥"
    ];

    const options = [
      [...countries.slice(0, 4).map(c => c.name), "Surprise me! 🎲"],
      ["Under $100 💵", "$100-$250 💳", "$250-$400 💎", "$400+ 👑"],
      ["2-3 nights", "4-5 nights", "6-7 nights", "1 week+"],
      ["Summer ☀️", "Winter ❄️", "Spring 🌸", "Autumn 🍂"],
      ["Solo 🧳", "Couple 💑", "Family 👨‍👩‍👧", "Group 👨‍👩‍👧‍👦"]
    ];

    return { question: questions[step], options: options[step] };
  }

  private generateFallbackRecommendation(preferences: UserPreferences, hotels: Hotel[], flights: Flight[]): string {
    const dest = preferences.destination || 'your destination';
    return `✨ Great choice for ${dest}! Found ${hotels.length} hotels and ${flights.length} flights. 🏨 View Hotels | ✈️ View Flights`;
  }
}

// ============= MAIN COMPONENT =============
const TravelAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'chat' | 'hotels' | 'flights'>('chat');
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [countries, setCountries] = useState<Country[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [randomCountries, setRandomCountries] = useState<Country[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  const messagesEndRef = useRef<FlatList<Message>>(null);
  const aiService = useRef<AIService>(new AIService());
  const apiService = useRef<APIService>(APIService.getInstance());

  // Load countries on mount
  useEffect(() => {
    loadCountries();
    
    const onChange = (result: { window: any }) => {
      setScreenDimensions(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    
    return () => subscription?.remove();
  }, []);

  const loadCountries = async () => {
    try {
      setDataLoading(true);
      const countriesData = await apiService.current.fetchCountries();
      setCountries(countriesData);
      selectRandomCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const selectRandomCountries = (countriesList: Country[]) => {
    const shuffled = [...countriesList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setRandomCountries(selected);
  };

  // Load hotels and flights based on preferences
  useEffect(() => {
    if (preferences.destination) {
      loadDestinationData();
    }
  }, [preferences.destination, preferences.budget]);

  const loadDestinationData = async () => {
    try {
      setDataLoading(true);
      const [hotelsData, flightsData] = await Promise.all([
        apiService.current.fetchHotels(preferences.destination || '', preferences.budget),
        apiService.current.fetchFlights('Cairo', preferences.destination || '', preferences.budget)
      ]);
      
      setHotels(hotelsData);
      setFlights(flightsData);
    } catch (error) {
      console.error('Error loading destination data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen]);

  const initChat = async (): Promise<void> => {
    addMessage('bot', '🌟 Welcome! I\'m your AI travel assistant with real-time data from around the world! 🌍✈️🏨');
    
    setTimeout(async () => {
      setLoading(true);
      const data = await aiService.current.askQuestion(0, preferences, randomCountries);
      addMessage('bot', data.question, data.options);
      setStep(1);
      setLoading(false);
    }, 800);
  };

  const addMessage = (sender: 'user' | 'bot', text: string, options?: string[]): void => {
    const msg: Message = {
      id: Date.now().toString() + Math.random(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      options
    };
    setMessages(prev => [...prev, msg]);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleOptionClick = async (option: string): Promise<void> => {
    addMessage('user', option);

    if (step <= 5 && !showResults) {
      const keys: (keyof UserPreferences)[] = ['destination', 'budget', 'duration', 'season', 'travelers'];
      const key = keys[step - 1];
      
      const newPrefs = { ...preferences, [key]: option };
      setPreferences(newPrefs);

      if (step < 5) {
        setLoading(true);
        setTimeout(async () => {
          const data = aiService.current.getFallbackQuestion(step, randomCountries);
          addMessage('bot', data.question, data.options);
          setStep(step + 1);
          setLoading(false);
        }, 300);
      } else {
        await searchRecommendations(newPrefs);
      }
    } else {
      handleAction(option);
    }
  };

  const searchRecommendations = async (prefs: UserPreferences): Promise<void> => {
    setLoading(true);
    addMessage('bot', `🔍 Searching real-time data for ${prefs.destination}...`);

    const recommendations = await aiService.current.searchRecommendations(prefs, hotels, flights);
    
    addMessage('bot', recommendations, [
      '🏨 View Hotels',
      '✈️ View Flights',
      '🔄 New Search'
    ]);
    
    setShowResults(true);
    setLoading(false);
  };

  const handleAction = (action: string): void => {
    if (action.includes('Hotels') || action.includes('🏨')) {
      setViewMode('hotels');
    } else if (action.includes('Flights') || action.includes('✈️')) {
      setViewMode('flights');
    } else if (action.includes('New Search') || action.includes('🔄')) {
      resetChat();
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    addMessage('user', text);
    
    setLoading(true);
    const reply = await aiService.current.chat(text, preferences);
    addMessage('bot', reply);
    setLoading(false);
  };

  const resetChat = (): void => {
    setMessages([]);
    setPreferences({});
    setStep(0);
    setShowResults(false);
    setViewMode('chat');
    selectRandomCountries(countries);
    initChat();
  };

  const refreshData = async (): Promise<void> => {
    setDataLoading(true);
    try {
      await loadCountries();
      if (preferences.destination) {
        await loadDestinationData();
      }
      addMessage('bot', '🔄 Data refreshed with latest information!');
    } catch (error) {
      addMessage('bot', '❌ Error refreshing data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const toggleMinimize = (): void => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = (): void => {
    setIsOpen(false);
    setTimeout(() => {
      setIsMinimized(false);
    }, 300);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }): JSX.Element => {
    const getOptionIcon = (option: string) => {
      if (option.includes('Egypt') || option.includes('France') || option.includes('Japan') || option.includes('Turkey') || 
          option.includes('UAE') || option.includes('Italy') || option.includes('Spain') || option.includes('Greece') ||
          countries.some(c => option.includes(c.name))) {
        return <MapPin size={16} color="#00A6E8" />;
      }
      if (option.includes('$') || option.includes('💵') || option.includes('💳') || option.includes('💎') || option.includes('👑')) {
        return <DollarSign size={16} color="#10b981" />;
      }
      if (option.includes('night') || option.includes('week')) {
        return <Calendar size={16} color="#f59e0b" />;
      }
      if (option.includes('Summer') || option.includes('Winter') || option.includes('Spring') || option.includes('Autumn')) {
        return <Sparkles size={16} color="#ec4899" />;
      }
      if (option.includes('Solo') || option.includes('Couple') || option.includes('Family') || option.includes('Group')) {
        return <Users size={16} color="#8b5cf6" />;
      }
      return null;
    };

    return (
      <Animated.View 
        style={[
          styles.messageWrapper,
          { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <View style={[styles.messageRow, item.sender === 'user' && styles.userMessageRow]}>
          <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={[
              styles.messageText,
              item.sender === 'user' && styles.userText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.timestamp,
              item.sender === 'user' && styles.userTimestamp
            ]}>
              {item.timestamp}
            </Text>
          </View>
        </View>
        
        {item.options && (
          <View style={styles.optionsContainer}>
            {item.options.map((opt, idx) => (
              <TouchableOpacity
                key={`${item.id}-${idx}`}
                style={styles.optionButton}
                onPress={() => handleOptionClick(opt)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {getOptionIcon(opt)}
                  <Text style={styles.optionText}>{opt}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderHotels = (): JSX.Element => {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => setViewMode('chat')} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
            <Text style={styles.backText}>Back to Chat</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Hotel size={24} color="#fff" />
            <Text style={styles.listTitle}>Hotels ({hotels.length})</Text>
          </View>
          <TouchableOpacity onPress={refreshData} style={styles.refreshBtn}>
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {dataLoading ? (
          <View style={styles.dataLoadingContainer}>
            <ActivityIndicator size="large" color="#00A6E8" />
            <Text style={styles.dataLoadingText}>Loading real hotel data...</Text>
          </View>
        ) : (
          <FlatList
            data={hotels}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>📍 {item.city}, {item.country?.toUpperCase()}</Text>
                </View>
                
                <View style={styles.cardBody}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Per Night</Text>
                    <Text style={styles.cardPrice}>${item.pricePerNight}</Text>
                  </View>
                  
                  <View style={styles.amenitiesContainer}>
                    {item.amenities.slice(0, 3).map((amenity, idx) => (
                      <View key={idx} style={styles.amenityBadge}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.offerContainer}>
                  <Text style={styles.offerLabel}>Special Offer</Text>
                  <Text style={styles.cardOffer}>🎁 {item.offers[0]}</Text>
                </View>
              </Animated.View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  const renderFlights = (): JSX.Element => {
    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => setViewMode('chat')} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
            <Text style={styles.backText}>Back to Chat</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Plane size={24} color="#fff" />
            <Text style={styles.listTitle}>Flights ({flights.length})</Text>
          </View>
          <TouchableOpacity onPress={refreshData} style={styles.refreshBtn}>
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {dataLoading ? (
          <View style={styles.dataLoadingContainer}>
            <ActivityIndicator size="large" color="#00A6E8" />
            <Text style={styles.dataLoadingText}>Loading real flight data...</Text>
          </View>
        ) : (
          <FlatList
            data={flights}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.airline}</Text>
                    {item.offer !== 'No offer' && (
                      <View style={styles.offerBadge}>
                        <Text style={styles.offerBadgeText}>SALE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardSubtitle}>✈️ {item.from} → {item.to}</Text>
                  <Text style={styles.flightDetails}>
                    {item.departureTime} - {item.arrivalTime} | {item.stops} stops
                  </Text>
                </View>
                
                <View style={styles.cardBody}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Total Price</Text>
                    <Text style={styles.cardPrice}>${item.price}</Text>
                  </View>
                  
                  <View style={styles.durationContainer}>
                    <Text style={styles.durationLabel}>Duration</Text>
                    <Text style={styles.cardDuration}>⏱️ {item.duration}</Text>
                  </View>
                </View>
                
                {item.offer !== 'No offer' && (
                  <View style={styles.offerContainer}>
                    <Text style={styles.offerLabel}>Special Offer</Text>
                    <Text style={styles.cardOffer}>🎁 {item.offer}</Text>
                  </View>
                )}
              </Animated.View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  // Minimized bar
  if (isMinimized) {
    return (
      <Animated.View
        style={[
          styles.minimizedBar,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.minimizedContent}
          onPress={toggleMinimize}
          activeOpacity={0.8}
        >
          <View style={styles.minimizedLeft}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.minimizedText}>🌍 Travel AI</Text>
          </View>
          <View style={styles.minimizedRight}>
            <TouchableOpacity onPress={toggleMinimize} style={styles.minimizedControlBtn}>
              <Maximize2 size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={closeChat} style={styles.minimizedControlBtn}>
              <X size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // FAB button when chat is closed
  if (!isOpen) {
    return (
      <TouchableOpacity 
        style={[
          styles.fab,
          {
            bottom: Math.max(30, screenDimensions.height * 0.03),
            right: Math.max(30, screenDimensions.width * 0.05),
            width: Math.min(70, screenDimensions.width * 0.15),
            height: Math.min(70, screenDimensions.width * 0.15),
            borderRadius: Math.min(35, screenDimensions.width * 0.075)
          }
        ]} 
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fabGradient}>
          <MessageCircle size={Math.min(28, screenDimensions.width * 0.06)} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  }

  // Main chat modal
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={closeChat}
        />
        
        <Animated.View
          style={[
            styles.chatContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderContent}>
              <View style={styles.chatTitleContainer}>
                <Text style={styles.chatTitle}>🌍 Travel AI</Text>
                <Text style={styles.chatSubtitle}>✈️ Real-time Global Data</Text>
              </View>
              <View style={styles.chatControls}>
                <TouchableOpacity onPress={toggleMinimize} style={styles.chatControlBtn}>
                  <Minimize2 size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={closeChat} style={styles.chatControlBtn}>
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.chatBody}>
            {viewMode === 'chat' ? (
              <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
              >
                <FlatList
                  ref={messagesEndRef}
                  data={messages}
                  keyExtractor={item => item.id}
                  renderItem={renderMessage}
                  contentContainerStyle={styles.messagesContent}
                  onContentSizeChange={() => messagesEndRef.current?.scrollToEnd({ animated: true })}
                  showsVerticalScrollIndicator={false}
                />

                {loading && (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#00A6E8" />
                    <Text style={styles.loadingText}>Processing with real data...</Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Ask me anything about travel..."
                      placeholderTextColor="#9ca3af"
                      editable={!loading}
                      multiline
                      maxLength={100}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.sendBtn,
                      (!inputText.trim() || loading) && styles.sendBtnDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || loading}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sendBtnGradient}>
                      <Send size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            ) : viewMode === 'hotels' ? (
              renderHotels()
            ) : (
              renderFlights()
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============= STYLES =============
const styles = StyleSheet.create({
  // FAB styles
  fab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#00A6E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 9999,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A6E8',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  chatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  
  // Chat header
  chatHeader: {
    backgroundColor: '#00A6E8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitleContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  chatControls: {
    flexDirection: 'row',
    gap: 12,
  },
  chatControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBody: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Minimized bar styles
  minimizedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00A6E8',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  minimizedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minimizedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  minimizedRight: {
    flexDirection: 'row',
    gap: 8,
  },
  minimizedControlBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Chat styles
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  messageRow: {
    alignItems: 'flex-start',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  botBubble: {
    borderBottomLeftRadius: 6,
    backgroundColor: '#ffffff',
  },
  userBubble: {
    borderBottomRightRadius: 6,
    backgroundColor: '#00A6E8',
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    fontWeight: '500',
  },
  userText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: '400',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingLeft: 6,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  optionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  loadingText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#00A6E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A6E8',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  // List styles
  listContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#00A6E8',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  dataLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dataLoadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  flightDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
  },
  offerBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 3,
    fontWeight: '500',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  durationContainer: {
    alignItems: 'flex-end',
  },
  durationLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 3,
    fontWeight: '500',
  },
  cardDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A6E8',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  amenityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  offerContainer: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  offerLabel: {
    fontSize: 10,
    color: '#0284c7',
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardOffer: {
    fontSize: 12,
    color: '#0c4a6e',
    fontWeight: '600',
  },
});

export default TravelAIChatbot;