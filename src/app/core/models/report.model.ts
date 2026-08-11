// src/app/core/models/report.model.ts
export interface Report {
  id: string;
  author_id: string;
  title: string;
  description: string;
  type: 'bache' | 'basura' | 'alumbrado' | 'seguridad' | 'agua' | 'otros';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado';
  location: any; // GeoJSON Point o null
  address: string | null;
  photo_url: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  public_comment: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  author?: { name: string; avatar_url: string | null };
}