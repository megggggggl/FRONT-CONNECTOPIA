export interface Event {
  id: string;
  organizer_id?: string;
  title: string;
  description: string | null;
  address: string | null;
  start_date: string;
  end_date: string | null;
  category_id: number | null;
  images: string[];
  max_participants: number | null;
  current_participants: number | null;
  status: string | null; // 'programado' | 'en_curso' | 'finalizado' | 'cancelado'
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}