export interface Report {
  id: string;
  author_id: string;
  title: string;
  description: string;
  type: string;
  location?: any;
  address?: string;
  photo_url?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
}