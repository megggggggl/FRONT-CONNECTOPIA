export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: 'anuncio' | 'alerta' | 'evento' | 'general';
  category_id?: number;
  location?: any;
  address?: string | null;
  images: string[];
  status: 'active' | 'inactive' | 'archived';
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}