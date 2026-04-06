import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';
import flightsReducer from '../features/flights/flightsSlice';
import hotelsReducer from '../features/hotels/hotelsSlice';
import destinationsReducer from "../features/homeslices/destinationsSlice";
import toursReducer from "../features/homeslices/toursSlice";
import roomsReducer from "../features/homeslices/roomsSlice";
import wishlistReducer from '../screens/Wishlist/wishlistSlice';
import countriesReducer from "../features/countries/countriesSlice"
import flightBookingReducer from '../features/bookings/flightBookingSlice';
import hotelBookingReducer from '../features/bookings/hotelBookingSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  bookings: bookingsReducer,
  flights: flightsReducer,
  hotels: hotelsReducer,
  destinations: destinationsReducer,
  tours: toursReducer,
  rooms: roomsReducer,
   wishlist: wishlistReducer,
   countries:countriesReducer,
   flightBooking: flightBookingReducer,
   hotelBooking:hotelBookingReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;