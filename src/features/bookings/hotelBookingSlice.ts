import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { hotelBookingApi } from "../../utils/api";

// Types
export interface HotelBooking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  guest: number;
  type: string;
  checkIn: string;
  checkOut: string;
  hotelname: string;
  hotelId: string;
  totalPrice?: number;
  numberOfNights?: number;
  paymentMethodId?: string;
  payment: string; 
}

interface HotelBookingState {
  bookings: HotelBooking[];
  userBookings: HotelBooking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HotelBookingState = {
  bookings: [],
  userBookings: [],
  isLoading: false,
  error: null,
};

// Thunks

export const createHotelBooking = createAsyncThunk<
  HotelBooking,
  Omit<HotelBooking, "id">,
  { rejectValue: string }
>(
  "hotelBooking/createHotelBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await hotelBookingApi.post<HotelBooking>(
        "/bookings/hotelbooking",
        bookingData
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create hotel booking"
      );
    }
  }
);

export const fetchUserHotelBookings = createAsyncThunk<
  HotelBooking[],
  string,
  { rejectValue: string }
>(
  "hotelBooking/fetchUserHotelBookings",
  async (email, { rejectWithValue }) => {
    try {
      const res = await hotelBookingApi.get<HotelBooking[]>(
        `/bookings/hotelbooking?email=${email}`
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user hotel bookings"
      );
    }
  }
);

// Slice

const hotelBookingSlice = createSlice({
  name: "hotelBooking",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearUserBookings(state) {
      state.userBookings = [];
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createHotelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createHotelBooking.fulfilled,
        (state, action: PayloadAction<HotelBooking>) => {
          state.isLoading = false;
          state.bookings.push(action.payload);
        }
      )
      .addCase(createHotelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create hotel booking";
      });

    // Fetch user bookings
    builder
      .addCase(fetchUserHotelBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserHotelBookings.fulfilled,
        (state, action: PayloadAction<HotelBooking[]>) => {
          state.isLoading = false;
          state.userBookings = action.payload;
        }
      )
      .addCase(fetchUserHotelBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch user hotel bookings";
      });
  },
});

export const { clearError, clearUserBookings } = hotelBookingSlice.actions;
export default hotelBookingSlice.reducer;
