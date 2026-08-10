export interface Place {
  id: string;
  name: string;
  description: string;
  category_id: number | null;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  images: string[];
  avg_rating: number;
  reviews_count: number;
  schedule: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  } | null;
  entrance_fee: string | null;
  is_featured: boolean;
  created_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: number; name: string };
  author?: { id: string; name: string; avatar_url: string };
}