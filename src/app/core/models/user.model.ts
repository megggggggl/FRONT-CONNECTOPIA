// core/models/user.model.ts

export interface User {
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
  telegram_chat_id?: string | null; // ← lo agregamos aquí
  created_at?: string;
  updated_at?: string;
}

// Respuestas genéricas (ya deberían estar en un archivo de api-response.model.ts)
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  user?: T;
  profile?: T;
}
export interface UserResponse {
  user?: User;
  profile?: User;
  data?: User;
}

export interface PaginatedResponse<T> {
  message?: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}