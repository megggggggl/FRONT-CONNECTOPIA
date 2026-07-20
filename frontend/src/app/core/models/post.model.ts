export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type?: string;
  category_id?: number;
  status?: string;
  is_urgent?: boolean;
  created_at?: string;
  updated_at?: string;
}