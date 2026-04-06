import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingsApi } from '../../utils/api';

export interface Booking {
  id: string;
  userId: string;
  type: string;
  flightId: string;
  hotelId: string;
  roomId: string;
  passengers: number;
  checkInDate: number;
  checkOutDate: number;
  totalPrice: number;
  status: string;
  createdAt: number;
  name: string;
  email: string;
  message: string;
}

interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  isLoading: false,
  error: null,
};

export const createBooking = createAsyncThunk<
  Booking,
  Omit<Booking, 'id' | 'createdAt'>,
  { rejectValue: string }
>('bookings/createBooking', async (bookingData, { rejectWithValue }) => {
  try {
    const res = await bookingsApi.post<Booking>('/bookings/bookings', {
      ...bookingData,
      createdAt: Date.now(),
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? 'Failed to create booking'
    );
  }
});

export const fetchBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>('bookings/fetchBookings', async (_, { rejectWithValue }) => {
  try {
    const res = await bookingsApi.get<Booking[]>('/bookings/bookings');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? 'Failed to fetch bookings'
    );
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isLoading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to create booking';
      })
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch bookings';
      });
  },
});

export default bookingsSlice.reducer;
