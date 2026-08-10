// core/services/service.service.ts
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, of, timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

// ============================================================
// INTERFACES
// ============================================================

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  price: string | null;
  location: any;
  latitude?: number ;
  longitude?: number ;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  images: string[];
  avg_rating: number;
  reviews_count: number;
  is_premium: boolean;
  is_verified: boolean;
  provider_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ServiceResponse {
  message?: string;
  data: Service[];
}

export interface ServiceSingleResponse {
  message?: string;
  data: Service;
}

export interface ServiceFilters {
  category?: number | string;
  status?: string;
  search?: string;
  is_premium?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface ServiceCreateData {
  name: string;
  description: string;
  category_id?: number | null;
  price?: string | null;
  location?: any;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  images?: string[];
  schedule?: any;
}

export interface ServiceUpdateData extends Partial<ServiceCreateData> {}

// ============================================================
// FUNCIÓN HELPER PARA EXTRAER EL ARRAY
// ============================================================
function extraerArray(respuesta: any): any[] {
  console.log('📦 Extraer array de:', respuesta);
  
  if (!respuesta) {
    console.warn('⚠️ Respuesta vacía o nula');
    return [];
  }

  // Caso 1: Es un array directamente
  if (Array.isArray(respuesta)) {
    console.log('✅ Es un array directo, longitud:', respuesta.length);
    return respuesta;
  }

  // Caso 2: Tiene propiedad 'data' que es array
  if (respuesta.data !== undefined) {
    if (Array.isArray(respuesta.data)) {
      console.log('✅ Tiene data como array, longitud:', respuesta.data.length);
      return respuesta.data;
    }
    // Si data no es array, intentar buscar más profundo
    if (respuesta.data && typeof respuesta.data === 'object') {
      if (Array.isArray(respuesta.data.data)) {
        console.log('✅ data.data es array, longitud:', respuesta.data.data.length);
        return respuesta.data.data;
      }
      // Buscar cualquier propiedad que sea array dentro de data
      for (const key of Object.keys(respuesta.data)) {
        if (Array.isArray(respuesta.data[key])) {
          console.log(`✅ data.${key} es array, longitud:`, respuesta.data[key].length);
          return respuesta.data[key];
        }
      }
    }
  }

  // Caso 3: Buscar cualquier propiedad que sea array en el objeto principal
  for (const key of Object.keys(respuesta)) {
    if (Array.isArray(respuesta[key]) && key !== 'data') {
      console.log(`✅ Propiedad '${key}' es array, longitud:`, respuesta[key].length);
      return respuesta[key];
    }
  }

  console.warn('⚠️ No se encontró ningún array en la respuesta');
  return [];
}

// ============================================================
// SERVICIO
// ============================================================

@Injectable({ providedIn: 'root' })
export class ServiceService {
  constructor(private api: ApiServicio) {}

  // ============================================================
  // LISTAR SERVICIOS CON FILTROS
  // ============================================================
 listarServicios(filtros?: ServiceFilters) {
  let url = '/services';
  const params = new URLSearchParams();
  // ... parámetros

  return this.api.get<Service[]>(url).pipe(
    map((respuesta) => {
      // El backend devuelve un array directo
      return Array.isArray(respuesta) ? respuesta : [];
    }),
    timeout(10000),
    catchError((error) => {
      console.error('Error al listar servicios:', error);
      return of([]);
    })
  );


    const query = params.toString();
    if (query) url += `?${query}`;

    return this.api.get<any>(url).pipe(
      map((respuesta) => extraerArray(respuesta) as Service[]),
      timeout(10000),
      catchError((error) => {
        console.error('Error al listar servicios:', error);
        return of([] as Service[]);
      })
    );
  }

  // ============================================================
  // OBTENER SERVICIO POR ID
  // ============================================================
  obtenerServicio(id: string) {
    return this.api.get<any>(`/services/${id}`).pipe(
      map((respuesta) => {
        // Si la respuesta tiene 'data', devolverlo; si no, devolver la respuesta misma
        return respuesta?.data || respuesta;
      }),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al obtener servicio ${id}:`, error);
        return of(null);
      })
    );
  }

  // ============================================================
  // SERVICIOS CERCANOS (geolocalización)
  // ============================================================
  serviciosCercanos(lat: number, lng: number, radius: number = 5000) {
    return this.api.get<any>(`/services/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).pipe(
      map((respuesta) => extraerArray(respuesta) as Service[]),
      timeout(10000),
      catchError((error) => {
        console.error('Error al obtener servicios cercanos:', error);
        return of([] as Service[]);
      })
    );
  }

  // ============================================================
  // SERVICIOS DEL PRESTADOR (filtro local)
  // ============================================================
  obtenerServiciosDelPrestador(idPrestador: string) {
    return this.listarServicios().pipe(
      map((servicios) => servicios.filter((s) => String(s.provider_id) === String(idPrestador))),
      catchError(() => of([]))
    );
  }

  // ============================================================
  // CRUD DE SERVICIOS
  // ============================================================
  crearServicio(data: ServiceCreateData) {
    return this.api.post<any>('/services', data).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(10000),
      catchError((error) => {
        console.error('Error al crear servicio:', error);
        throw error;
      })
    );
  }

  actualizarServicio(id: string, data: ServiceUpdateData) {
    return this.api.patch<any>(`/services/${id}`, data).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(10000),
      catchError((error) => {
        console.error(`Error al actualizar servicio ${id}:`, error);
        throw error;
      })
    );
  }

  eliminarServicio(id: string) {
    return this.api.delete<any>(`/services/${id}`).pipe(
      map((respuesta) => respuesta?.message || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al eliminar servicio ${id}:`, error);
        throw error;
      })
    );
  }

  cambiarEstado(id: string, status: string) {
    return this.api.patch<any>(`/services/${id}/status`, { status }).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al cambiar estado del servicio ${id}:`, error);
        throw error;
      })
    );
  }

  togglePremium(id: string, isPremium: boolean) {
    return this.api.post<any>(`/services/${id}/premium`, { is_premium: isPremium }).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al cambiar premium del servicio ${id}:`, error);
        throw error;
      })
    );
  }

  reportarServicio(id: string, motivo: string, descripcion: string) {
    return this.api.post<any>(`/services/${id}/report`, { reason: motivo, description: descripcion }).pipe(
      map((respuesta) => respuesta?.message || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al reportar servicio ${id}:`, error);
        throw error;
      })
    );
  }

  // ============================================================
  // RESEÑAS DE SERVICIOS
  // ============================================================
  listarResenas(serviceId: string) {
    return this.api.get<any>(`/services/${serviceId}/reviews`).pipe(
      map((respuesta) => extraerArray(respuesta)),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al listar reseñas del servicio ${serviceId}:`, error);
        return of([]);
      })
    );
  }

  crearResena(serviceId: string, rating: number, comment: string, images?: string[]) {
    return this.api.post<any>(`/services/${serviceId}/reviews`, { rating, comment, images }).pipe(
      timeout(10000),
      catchError((error) => {
        console.error(`Error al crear reseña para servicio ${serviceId}:`, error);
        throw error;
      })
    );
  }

  actualizarResena(reviewId: string, data: any) {
    return this.api.patch<any>(`/services/reviews/${reviewId}`, data).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(`Error al actualizar reseña ${reviewId}:`, error);
        throw error;
      })
    );
  }

  eliminarResena(reviewId: string) {
    return this.api.delete<any>(`/services/reviews/${reviewId}`).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(`Error al eliminar reseña ${reviewId}:`, error);
        throw error;
      })
    );
  }

  reportarResena(reviewId: string, motivo: string, descripcion: string) {
    return this.api.post<any>(`/services/reviews/${reviewId}/report`, { reason: motivo, description: descripcion }).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(`Error al reportar reseña ${reviewId}:`, error);
        throw error;
      })
    );
  }

  // ============================================================
  // OBTENER RESEÑAS DE VARIOS SERVICIOS (forkJoin)
  // ============================================================
  obtenerResenasDeServicios(servicios: Service[]) {
    if (!servicios.length) return of([]);

    const peticiones = servicios.map((servicio) =>
      this.api.get<any>(`/services/${servicio.id}/reviews`).pipe(
        timeout(8000),
        map((respuesta) => {
          const resenas = extraerArray(respuesta);
          return resenas.map((r: any) => ({ ...r, servicio_nombre: servicio.name }));
        }),
        catchError(() => of([]))
      )
    );

    return forkJoin(peticiones).pipe(map((respuestas) => respuestas.flat()));
  }
}