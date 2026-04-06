import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { countriesApi } from '../../utils/api';

export interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  price: number;
  offer: string;
  passanger: number;  
  duratuion: string;  
  type: 'economy' | 'firstclass';
  image?: string;
}

export interface City {
  id: string;
  name: string;
  des: string;
  flights: Flight[];
}

export interface Country {
  id: string;
  name: string;
  cun_des: string;
  city: City[];
}

interface FlightsState {
  countries: Country[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FlightsState = {
  countries: [],
  status: 'idle',
  error: null,
};

export const fetchCountries = createAsyncThunk<
  Country[],
  void,
  { rejectValue: string }
>('flights/fetchCountries', async (_, { rejectWithValue }) => {
  try {
    const res = await countriesApi.get<Country[]>('/countries');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? 'Failed to fetch countries'
    );
  }
});

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<Country[]>) => {
        state.status = 'succeeded';
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch countries';
      });
  },
});

export default flightsSlice.reducer;
