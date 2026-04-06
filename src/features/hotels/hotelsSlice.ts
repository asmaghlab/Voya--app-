import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { hotelsApi } from "../../utils/api";
import { IHotel } from "./type";

interface HotelsState {
  hotels: IHotel[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: HotelsState = {
  hotels: [],
  status: "idle",
  error: null,
};

/**
 * Helper to normalize API response
 */
const extractHotelsArray = (data: any): IHotel[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const extractSingleHotel = (data: any): IHotel | null => {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data.data ?? data;
  }
  return null;
};

// ================== THUNKS ==================

export const fetchHotels = createAsyncThunk<
  IHotel[],
  void,
  { rejectValue: string }
>("hotels/fetchHotels", async (_, { rejectWithValue }) => {
  try {
    const res = await hotelsApi.get("/hotels");
    return extractHotelsArray(res.data);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to fetch hotels"
    );
  }
});

export const fetchHotelByCountryId = createAsyncThunk<
  IHotel[],
  string,
  { rejectValue: string }
>("hotels/fetchHotelByCountryId", async (countryId, { rejectWithValue }) => {
  try {
    const res = await hotelsApi.get(`/hotels?countryId=${countryId}`);
    return extractHotelsArray(res.data);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to fetch hotels"
    );
  }
});

export const fetchHotelById = createAsyncThunk<
  IHotel,
  string,
  { rejectValue: string }
>("hotels/fetchHotelById", async (id, { rejectWithValue }) => {
  try {
    const res = await hotelsApi.get(`/hotels/${id}`);
    const hotel = extractSingleHotel(res.data);
    if (!hotel) throw new Error("Invalid hotel response");
    return hotel;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to fetch hotel"
    );
  }
});

export const addHotel = createAsyncThunk<
  IHotel,
  Omit<IHotel, "id">,
  { rejectValue: string }
>("hotels/addHotel", async (hotelData, { rejectWithValue }) => {
  try {
    const res = await hotelsApi.post("/hotels", hotelData);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to add hotel"
    );
  }
});

export const editHotel = createAsyncThunk<
  IHotel,
  { id: string; data: Omit<IHotel, "id"> },
  { rejectValue: string }
>("hotels/editHotel", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await hotelsApi.put(`/hotels/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to edit hotel"
    );
  }
});

export const deleteHotel = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("hotels/deleteHotel", async (id, { rejectWithValue }) => {
  try {
    await hotelsApi.delete(`/hotels/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message ?? "Failed to delete hotel"
    );
  }
});

// ================== SLICE ==================

const hotelsSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchHotels
      .addCase(fetchHotels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHotels.fulfilled,
        (state, action: PayloadAction<IHotel[]>) => {
          state.status = "succeeded";
          state.hotels = action.payload;
        }
      )
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch hotels";
      })

      // fetchHotelByCountryId
      .addCase(fetchHotelByCountryId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHotelByCountryId.fulfilled,
        (state, action: PayloadAction<IHotel[]>) => {
          state.status = "succeeded";
          state.hotels = action.payload;
        }
      )
      .addCase(fetchHotelByCountryId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch hotels";
      })

      // fetchHotelById
      .addCase(fetchHotelById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchHotelById.fulfilled,
        (state, action: PayloadAction<IHotel>) => {
          state.status = "succeeded";
          state.hotels = [action.payload];
        }
      )
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch hotel";
      })

      // addHotel
      .addCase(addHotel.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hotels.push(action.payload);
      })
      .addCase(addHotel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to add hotel";
      })

      // deleteHotel
      .addCase(deleteHotel.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hotels = state.hotels.filter(
          (hotel) => hotel.id !== action.payload
        );
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to delete hotel";
      })

      // editHotel
      .addCase(editHotel.pending, (state) => {
        state.status = "loading";
      })
      .addCase(editHotel.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.hotels.findIndex(
          (h) => h.id === action.payload.id
        );
        if (index !== -1) state.hotels[index] = action.payload;
      })
      .addCase(editHotel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to edit hotel";
      });
  },
});

export default hotelsSlice.reducer;
