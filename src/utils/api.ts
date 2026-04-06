// src/utils/api.ts
import axios from 'axios';

// Users (Auth)
export const authApi = axios.create({
  baseURL: "https://692b1d9e7615a15ff24ec4d9.mockapi.io",
  headers: { "Content-Type": "application/json" },
});

// Countries / Flights
export const countriesApi = axios.create({
  baseURL: 'https://6927461426e7e41498fdb2c5.mockapi.io',
  headers: { 'Content-Type': 'application/json' },
});

// Hotels
export const hotelsApi = axios.create({
  baseURL: "https://6934ceba4090fe3bf020c412.mockapi.io/api/v1",
  timeout: 5000,
});

// Bookings
export const bookingsApi = axios.create({
  baseURL: 'https://69287bd0b35b4ffc5015daf4.mockapi.io',
  headers: { 'Content-Type': 'application/json' },
});





export const flightBookingApi = axios.create({
  baseURL: "https://692b1d9e7615a15ff24ec4d9.mockapi.io",
  headers: { "Content-Type": "application/json" },
});

export const hotelBookingApi = axios.create({
  baseURL: "https://69287bd0b35b4ffc5015daf4.mockapi.io",
  headers: { "Content-Type": "application/json" },
});
