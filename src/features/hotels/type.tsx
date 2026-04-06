export interface IHotel {
  id: string;
  name?: string;
  countryId?: string; // e.g. "egypt"
  cityId?: string; // e.g. "cairo"
  pricePerNight?: number;
  currency?: string; // e.g. "USD"
  offers?: string[]; // list of short offer descriptions
  stayDuration?: number; // suggested/default stay in nights
  images: string[]; // image URLs
  lat?: string;
  lng?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number; // e.g. 4.5
  reviewCount?: number;
  amenities?: string[]; // list of amenity strings
  checkIn?: string; // e.g. "14:00"
  checkOut?: string; // e.g. "12:00"
  description?: string;
  stars?: number; // star rating, e.g. 5
  neighborhood?: string;
  propertyType?: string; // e.g. "Palace Hotel & Casino"
  distanceFromCenter?: string; // e.g. "3.5 km"
}

// ===== ADD Hotel Schema =========

import { z } from "zod";

export const addHotelSchema = z.object({
  name: z.string().min(2),
  countryId: z.string(),
  cityId: z.string(),
  pricePerNight: z.number().min(1),
  offers: z.string().optional(),
  stayDuration: z.number().min(1),
  images: z.string().url().optional(),
  lat: z.string().regex(/^-?\d+(\.\d+)?$/, "Longitude must be a valid number"),
  lng: z.string().regex(/^-?\d+(\.\d+)?$/, "Longitude must be a valid number"),
  address: z.string().min(3),
  phone: z.string().min(3),
  website: z.string().url(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  currency: z.string(),
  amenities: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  description: z.string().min(10),
  stars: z.number().min(1).max(5),
  neighborhood: z.string(),
  propertyType: z.string(),
  distanceFromCenter: z.string(),
});

export type AddHotelSchemaType = z.infer<typeof addHotelSchema>;

export const addHotelDefaultValues: AddHotelSchemaType = {
  name: "",
  countryId: "",
  cityId: "",
  pricePerNight: 0,
  offers: "",
  stayDuration: 1,
  images: "",
  lat: "0",
  lng: "0",
  address: "",
  phone: "",
  website: "",
  rating: 0,
  reviewCount: 0,
  currency: "USD",
  amenities: "",
  checkIn: "",
  checkOut: "",
  description: "",
  stars: 1,
  neighborhood: "",
  propertyType: "",
  distanceFromCenter: "",
};
