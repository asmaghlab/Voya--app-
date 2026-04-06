import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { flightBookingApi } from "../../utils/api";

//  Types 

export interface FlightBooking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  type: string;
  from: string;
  to: string;
  date: string;
  airline: string;
  payment: string; 
}

interface FlightBookingState {
  bookings: FlightBooking[];
  userBookings: FlightBooking[];
  isLoading: boolean;
  error: string | null;
}

// Initial State 

const initialState: FlightBookingState = {
  bookings: [],
  userBookings: [],
  isLoading: false,
  error: null,
};

// Thunks 

export const createFlightBooking = createAsyncThunk<
  FlightBooking,
  Omit<FlightBooking, "id">,
  { rejectValue: string }
>(
  "flightBooking/createFlightBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await flightBookingApi.post<FlightBooking>(
        "/flightbooking",
        bookingData
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create flight booking"
      );
    }
  }
);

export const fetchFlightBookings = createAsyncThunk<
  FlightBooking[],
  void,
  { rejectValue: string }
>("flightBooking/fetchFlightBookings", async (_, { rejectWithValue }) => {
  try {
    const res = await flightBookingApi.get<FlightBooking[]>("/flightbooking");
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch flight bookings"
    );
  }
});

export const fetchUserFlightBookings = createAsyncThunk<
  FlightBooking[],
  string,
  { rejectValue: string }
>(
  "flightBooking/fetchUserFlightBookings",
  async (email, { rejectWithValue }) => {
    try {
      const res = await flightBookingApi.get<FlightBooking[]>(
        `/flightbooking?email=${email}`
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user flight bookings"
      );
    }
  }
);

// ---------------- Slice --------------------

const flightBookingSlice = createSlice({
  name: "flightBooking",
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
    builder
      .addCase(createFlightBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createFlightBooking.fulfilled,
        (state, action: PayloadAction<FlightBooking>) => {
          state.isLoading = false;
          state.bookings.push(action.payload);
        }
      )
      .addCase(createFlightBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create flight booking";
      })
      .addCase(fetchFlightBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchFlightBookings.fulfilled,
        (state, action: PayloadAction<FlightBooking[]>) => {
          state.isLoading = false;
          state.bookings = action.payload;
        }
      )
      .addCase(fetchFlightBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch flight bookings";
      })
      .addCase(fetchUserFlightBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserFlightBookings.fulfilled,
        (state, action: PayloadAction<FlightBooking[]>) => {
          state.isLoading = false;
          state.userBookings = action.payload;
        }
      )
      .addCase(fetchUserFlightBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch user flight bookings";
      });
  },
});

export const { clearError, clearUserBookings } = flightBookingSlice.actions;
export default flightBookingSlice.reducer;