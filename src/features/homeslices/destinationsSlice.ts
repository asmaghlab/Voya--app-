import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Destination } from "./types";

interface DestinationsState {
  items: Destination[];
  loading: boolean;
  error: string | null;
}

const initialState: DestinationsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to fetch destinations from API
export const fetchDestinations = createAsyncThunk(
  "destinations/fetchDestinations",
  async () => {
    const response = await fetch("https://6927461426e7e41498fdb2c5.mockapi.io/countries");
    if (!response.ok) {
      throw new Error("Failed to fetch destinations");
    }
    const data = await response.json();
    
    // Map the API data to match our Destination interface
    // Take only first 6 items
    return data.slice(0, 6).map((country: any) => ({
      id: country.id,
      name: country.name,
      tours: country.tours || Math.floor(Math.random() * 5) + 1, // Use API tours or random
      image: country.image || country.flag || `https://images.unsplash.com/photo-${country.id}?w=400&h=300&fit=crop`,
      description: country.description || `Explore the beautiful destinations in ${country.name}`,
    }));
  }
);

const destinationsSlice = createSlice({
  name: "destinations",
  initialState,
  reducers: {
    setDestinations: (state, action: PayloadAction<Destination[]>) => {
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
      .addCase(fetchDestinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load destinations";
      });
  },
});

export const { setDestinations, setLoading, setError } = destinationsSlice.actions;
export default destinationsSlice.reducer;