export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  type: 'anuncio' | 'alerta' | 'evento' | 'general' | 'empleo';
  is_urgent: boolean;
  images: string[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  // 👇 Campos para empleos
  metadata?: {
    empresa?: string;
    salario?: string;
    contacto?: string;
    ubicacion?: string;
    requisitos?: string[] | string; // Puede ser array o string
    jornada?: 'tiempo_completo' | 'medio_tiempo' | 'freelance' | 'temporal';
  };
  author?: { id: string; name: string; avatar_url: string };
}