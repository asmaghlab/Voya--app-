// FlightsTypes/Flightstypes.ts
export interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  city: string;
  country?: string;
  price: number;
  passanger: number;
  image: string;
  duration: string;
  offer?: string;
}

export interface Country {
  id: number;
  name: string;
  image: string;
  city: {
    id: number;
    name: string;
    flights: Flight[];
  }[];
}

export interface FlightBooking {
  flightId: number;
  flightName: string;
  passengers: number;
  totalPrice: number;
}
