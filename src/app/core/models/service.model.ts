export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  price: string | null;
  location?: any;
  latitude?: number | null;
  longitude?: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[];
  avg_rating: number | string | null;
  reviews_count: number | null;
  is_premium: boolean;
  is_verified: boolean;
  provider_verified: boolean;
  status: string;
  schedule?: any;
  created_at?: string;
  updated_at?: string;
}