import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Tour } from "./types";

interface ToursState {
  popularTours: Tour[];
  freshlyAdded: Tour[];
  loading: boolean;
  error: string | null;
}

const initialState: ToursState = {
  popularTours: [],
  freshlyAdded: [],
  loading: false,
  error: null,
};

// Async thunk to fetch tours from API
export const fetchFreshlyAddedTours = createAsyncThunk(
  "tours/fetchFreshlyAdded",
  async () => {
    const response = await fetch("https://6927461426e7e41498fdb2c5.mockapi.io/countries");
    if (!response.ok) {
      throw new Error("Failed to fetch tours");
    }
    const data = await response.json();
    
    // Extract flights from first 6 countries and map them to Tour format
    const tours: Tour[] = [];
    
    for (let i = 0; i < Math.min(6, data.length); i++) {
      const country = data[i];
      if (country.city && country.city[0] && country.city[0].flights && country.city[0].flights[0]) {
        const flight = country.city[0].flights[0];
        
        tours.push({
          id: flight.id,
          title: `${country.name} - ${flight.from} to ${flight.to}`,
          image: country.image,
          duration: flight.duratuion,
          price: flight.price,
          originalPrice: flight.offer !== "No offer" ? Math.floor(flight.price * 1.2) : undefined,
          rating: country.rating || 5,
          reviews: 1,
          badge: flight.offer !== "No offer" ? flight.offer : undefined,
        });
      }
    }
    
    return tours;
  }
);

const toursSlice = createSlice({
  name: "tours",
  initialState,
  reducers: {
    setPopularTours: (state, action: PayloadAction<Tour[]>) => {
      state.popularTours = action.payload;
    },
    setFreshlyAdded: (state, action: PayloadAction<Tour[]>) => {
      state.freshlyAdded = action.payload;
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
      .addCase(fetchFreshlyAddedTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFreshlyAddedTours.fulfilled, (state, action) => {
        state.loading = false;
        state.freshlyAdded = action.payload;
      })
      .addCase(fetchFreshlyAddedTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load tours";
      });
  },
});

export const { setPopularTours, setFreshlyAdded, setLoading, setError } = toursSlice.actions;
export default toursSlice.reducer;