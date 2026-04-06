// types/country.ts

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  price: number;
  offer?: string;
  duratuion: string; 
}

export interface City {
  id: string;
  name: string;
  des: string; // description
  flights?: Flight[];
}

export interface Country {
  id: string;
  name: string;
  image: string;
  rating?: number;
  city?: City[];
  cun_des?: string; // country description
}