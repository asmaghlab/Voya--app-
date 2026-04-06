import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Room } from "./types";

interface RoomsState {
  items: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to fetch hotels from API
export const fetchHotels = createAsyncThunk(
  "rooms/fetchHotels",
  async () => {
    const response = await fetch("https://6934ceba4090fe3bf020c412.mockapi.io/api/v1/hotels");
    if (!response.ok) {
      throw new Error("Failed to fetch hotels");
    }
    const data = await response.json();
    
    // Map the first 6 hotels to Room interface
    return data.slice(0, 6).map((hotel: any) => {
      // Calculate discount if offers exist
      const hasOffer = hotel.offers && hotel.offers.length > 0;
      const offersText = hasOffer ? hotel.offers[0] : undefined;
      
      // Extract discount percentage from offers
      const discountMatch = offersText?.match(/(\d+)%/);
      const discountPercent = discountMatch ? parseInt(discountMatch[1]) : 0;
      
      const originalPrice = discountPercent > 0 
        ? Math.round(hotel.pricePerNight / (1 - discountPercent / 100)) 
        : undefined;
      
      return {
        id: hotel.id,
        title: hotel.name,
        image: hotel.images && hotel.images[0] ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=350&fit=crop",
        bedType: hotel.stars >= 4 ? "King Beds" : "Double Beds",
        price: hotel.pricePerNight,
        originalPrice: originalPrice,
        rating: Math.min(5, Math.round(hotel.rating)),
        reviews: hotel.reviewCount,
        badge: discountPercent > 0 ? `${discountPercent}% OFF` : undefined,
      };
    });
  }
);

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load hotels";
      });
  },
});

export const { setRooms, setLoading, setError } = roomsSlice.actions;
export default roomsSlice.reducer;