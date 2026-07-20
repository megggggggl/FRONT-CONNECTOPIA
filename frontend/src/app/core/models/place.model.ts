export interface Place {
  id: string;
  name: string;
  description?: string;
  address: string | null;
  category_id?: number;
  location?: any;
  images?: string[];
  avg_rating?: number;
  reviews_count?: number;
  created_at?: string;
}