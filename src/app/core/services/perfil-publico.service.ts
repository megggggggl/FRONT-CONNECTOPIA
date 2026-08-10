import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';

export interface PerfilPublico {
  perfil: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
    phone: string | null;
    address: string | null;
    id_verified: boolean;
    created_at: string;
  };
  estadisticas: {
    posts: number;
    servicios: number;
    resenas: number;
    calificacion_promedio: number;
  };
  resenas_recientes: any[];
  publicaciones_recientes: any[];
  badges: { icon: string; label: string }[];
}

@Injectable({ providedIn: 'root' })
export class PerfilPublicoService {
  constructor(private http: HttpClient) {}

  obtenerPerfilPublico(id: string): Observable<PerfilPublico> {
    return this.http.get<PerfilPublico>(`${WebServices.ProfileGet(id)}/public`);
  }

  obtenerPublicaciones(id: string, page = 1, limit = 10): Observable<any> {
    return this.http.get(`${WebServices.ProfileGet(id)}/public/posts?page=${page}&limit=${limit}`);
  }

  obtenerServicios(id: string): Observable<any> {
    return this.http.get(`${WebServices.ProfileGet(id)}/public/services`);
  }

  obtenerReseñas(id: string, page = 1, limit = 10): Observable<any> {
    return this.http.get(`${WebServices.ProfileGet(id)}/public/reviews?page=${page}&limit=${limit}`);
  }
}