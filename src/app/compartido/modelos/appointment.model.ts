export interface RespuestaEnlaceTelegram {
  url?: string;
  link?: string;
  start_command?: string;
  expires_in_minutes?: number;
  data?: {
    url?: string;
    link?: string;
    start_command?: string;
    expires_in_minutes?: number;
  };
  message?: string;
  error?: string;
}

export type EstadoSolicitudCita =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'delivery_failed'
  | 'cancelled'
  | 'expired'
  | string;

export interface SolicitudCita {
  id: string;
  service_id?: string | null;
  provider_id?: string | null;
  requester_id?: string | null;
  neighbor_id?: string | null;
  status: EstadoSolicitudCita;
  requested_date?: string | null;
  requested_time?: string | null;
  requested_at?: string | null;
  scheduled_at?: string | null;
  address?: string | null;
  description?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  service?: {
    id?: string;
    name?: string;
    title?: string;
  } | null;
  provider?: {
    id?: string;
    name?: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
  neighbor?: {
    id?: string;
    name?: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
}

export type AccionHistorialCita = 'hide' | 'archive' | 'delete';

export interface RespuestaListaSolicitudes {
  message?: string;
  data?: SolicitudCita[];
  appointments?: SolicitudCita[];
  items?: SolicitudCita[];
  results?: SolicitudCita[];
  error?: string;
}

export interface PayloadSolicitudCitaTelegram {
  service_id: string;
}
// src/app/compartido/modelos/appointment.model.ts

// ... (lo que ya tengas)

export interface ServicioDisponibleCita {
  service_id: string;
  provider_id: string;
  provider_name: string;
  provider_email?: string;
  provider_avatar?: string;
  service_name: string;
  service_description?: string;
  service_category?: string;
  service_status?: string;
  // ✅ Agregamos estas propiedades que el código espera
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  email?: string;
}