// src/store/slices/countriesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Country } from "../../types/country";

const API_URL = "https://6927461426e7e41498fdb2c5.mockapi.io/countries";

// Fetch all countries
export const fetchCountries = createAsyncThunk(
  "countries/fetchCountries",
  async () => {
    const res = await axios.get<Country[]>(API_URL);
    return res.data;
  }
);

// Fetch single country by id
export const fetchCountryById = createAsyncThunk(
  "countries/fetchCountryById",
  async (id: string) => {
    const res = await axios.get<Country>(`${API_URL}/${id}`);
    return res.data;
  }
);

interface CountriesState {
  countries: Country[];
  selectedCountry?: Country | null;
  loading: boolean;
  error: string | null;
  search: string;
  currentPage: number;
  itemsPerPage: number;
}

const initialState: CountriesState = {
  countries: [],
  selectedCountry: null,
  loading: false,
  error: null,
  search: "",
  currentPage: 1,
  itemsPerPage: 8,
};

export const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearSelectedCountry: (state) => {
      state.selectedCountry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
        state.loading = false;
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load countries";
      })
      .addCase(fetchCountryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountryById.fulfilled, (state, action) => {
        state.selectedCountry = action.payload;
        state.loading = false;
      })
      .addCase(fetchCountryById.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load country";
      });
  },
});

export const { setSearch, setPage, clearSelectedCountry } = countriesSlice.actions;
export default countriesSlice.reducer;