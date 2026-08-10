// src/app/compartido/modelos/perfil.model.ts

export interface Perfil {
  id: string;
  name: string;
  email: string;
  role: 'vecino' | 'prestador' | 'admin' | 'turista' | string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  email_verified?: boolean;
  id_verified: boolean;
  id_verification_status?: string | null;
  id_document_number?: string | null;
  fecha_nacimiento?: string | null;
  telegram_chat_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RespuestaPerfil {
  user?: Perfil;
  profile?: Perfil;
  data?: Perfil;
}

export interface RespuestaLista<T> {
  message?: string;
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// ========== NUEVAS INTERFACES ==========
export interface ServicioResumen {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  price: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[];
  avg_rating: number | string;
  reviews_count: number | null;
  is_premium: boolean;
  is_verified: boolean;
  provider_verified: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Resena {
  id: string;
  service_id: string;
  author_id: string;
  rating: number;
  comment: string | null;
  images: string[];
  is_verified: boolean;
  created_at: string;
  author?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  servicio_nombre?: string;
}
// ... (las interfaces que ya tienes)

export interface Publicacion {
  id: string;
  author_id: string;
  title: string;
  content: string;
  status?: string;
  created_at?: string;
}

export interface Denuncia {
  id: string;
  author_id: string;
  title: string;
  description: string;
  status?: string;
  created_at?: string;
}

// ... resto