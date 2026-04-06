export interface Destination {
  id: number;
  name: string;
  tours: number;
  image: string;
  description: string;
}

export interface Tour {
  id: number;
  title: string;
  image: string;
  duration?: string;
  originalPrice?: number;
  price: number;
  rating: number;
  reviews?: number;
  badge?: string;
}

export interface Room {
  id: number;
  title: string;
  image: string;
  bedType: string;
  originalPrice?: number;
  price: number;
  rating: number;
  reviews: number;
  badge?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  comment: string;
}
