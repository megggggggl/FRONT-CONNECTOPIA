export interface Review {
  id: string;
  service_id: string;
  author_id: string;
  rating: number;
  comment: string | null;
  images: string[];
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  servicio_nombre?: string;
}