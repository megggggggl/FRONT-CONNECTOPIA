export interface Category {
  id: number;
  name: string;
  entity_type?: string; // 'service', 'place', 'event', 'post'
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}