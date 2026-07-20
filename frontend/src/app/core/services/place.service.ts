// core/services/place.service.ts
import { Injectable } from '@angular/core';
import { timeout, catchError, of, map } from 'rxjs';
import { ApiServicio } from './api.servicio';

// ============================================================
// INTERFACES
// ============================================================

export interface Place {
  id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  location: any;
  address: string | null;
  phone: string | null;
  website: string | null;
  images: string[];
  avg_rating: number;
  reviews_count: number;
  schedule: any;
  entrance_fee: string | null;
  is_featured: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceResponse {
  message?: string;
  data: Place[];
}

export interface PlaceSingleResponse {
  message?: string;
  data: Place;
}

export interface PlaceCreateData {
  name: string;
  description?: string | null;
  category_id?: number | null;
  location?: any;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  images?: string[];
  schedule?: any;
  entrance_fee?: string | null;
  is_featured?: boolean;
}

export interface PlaceUpdateData extends Partial<PlaceCreateData> {}

export interface PlaceFilters {
  category?: number | string;
  search?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================
// FUNCIÓN HELPER PARA EXTRAER EL ARRAY
// ============================================================
function extraerArray(respuesta: any): any[] {
  console.log('📦 Extraer array de:', respuesta);
  
  if (!respuesta) {
    console.warn('⚠️ Respuesta vacía o nula');
    return [];
  }

  if (Array.isArray(respuesta)) {
    console.log('✅ Es un array directo, longitud:', respuesta.length);
    return respuesta;
  }

  if (respuesta.data !== undefined) {
    if (Array.isArray(respuesta.data)) {
      console.log('✅ Tiene data como array, longitud:', respuesta.data.length);
      return respuesta.data;
    }
    if (respuesta.data && typeof respuesta.data === 'object') {
      if (Array.isArray(respuesta.data.data)) {
        console.log('✅ data.data es array, longitud:', respuesta.data.data.length);
        return respuesta.data.data;
      }
      for (const key of Object.keys(respuesta.data)) {
        if (Array.isArray(respuesta.data[key])) {
          console.log(`✅ data.${key} es array, longitud:`, respuesta.data[key].length);
          return respuesta.data[key];
        }
      }
    }
  }

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
export class PlaceService {
  constructor(private api: ApiServicio) {}

  // ============================================================
  // LISTAR LUGARES CON FILTROS
  // ============================================================
  listarLugares(filtros?: PlaceFilters) {
  let url = '/places';
  const params = new URLSearchParams();
  // ... parámetros

  return this.api.get<PlaceResponse>(url).pipe(
    map((respuesta) => {
      // El backend devuelve { message, data: [] }
      return respuesta?.data || [];
    }),
    timeout(10000),
    catchError((error) => {
      console.error('Error al listar lugares:', error);
      return of([]);
    })
  );


    const query = params.toString();
    if (query) url += `?${query}`;

    return this.api.get<any>(url).pipe(
      map((respuesta) => extraerArray(respuesta) as Place[]),
      timeout(10000),
      catchError((error) => {
        console.error('Error al listar lugares:', error);
        return of([] as Place[]);
      })
    );
  }

  // ============================================================
  // OBTENER LUGAR POR ID
  // ============================================================
  obtenerLugar(id: string) {
    return this.api.get<any>(`/places/${id}`).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al obtener lugar ${id}:`, error);
        return of(null);
      })
    );
  }

  // ============================================================
  // CREAR NUEVO LUGAR (solo admin)
  // ============================================================
  crearLugar(data: PlaceCreateData) {
    return this.api.post<any>('/places', data).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(10000),
      catchError((error) => {
        console.error('Error al crear lugar:', error);
        throw error;
      })
    );
  }

  // ============================================================
  // ACTUALIZAR LUGAR (solo admin)
  // ============================================================
  actualizarLugar(id: string, data: PlaceUpdateData) {
    return this.api.put<any>(`/places/${id}`, data).pipe(
      map((respuesta) => respuesta?.data || respuesta),
      timeout(10000),
      catchError((error) => {
        console.error(`Error al actualizar lugar ${id}:`, error);
        throw error;
      })
    );
  }

  // ============================================================
  // ELIMINAR LUGAR (soft delete, solo admin)
  // ============================================================
  eliminarLugar(id: string) {
    return this.api.delete<any>(`/places/${id}`).pipe(
      map((respuesta) => respuesta?.message || respuesta),
      timeout(8000),
      catchError((error) => {
        console.error(`Error al eliminar lugar ${id}:`, error);
        throw error;
      })
    );
  }

  // ============================================================
  // MÉTODOS AUXILIARES
  // ============================================================
  listarLugaresPorCategoria(categoryId: number) {
    return this.listarLugares({ category: categoryId });
  }

  listarLugaresDestacados() {
    return this.listarLugares({ is_featured: true });
  }

  buscarLugares(query: string) {
    return this.listarLugares({ search: query });
  }

  lugaresCercanos(lat: number, lng: number, radius: number = 5000) {
    return this.api.get<any>(`/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).pipe(
      map((respuesta) => extraerArray(respuesta) as Place[]),
      timeout(10000),
      catchError((error) => {
        console.error('Error al obtener lugares cercanos:', error);
        return of([] as Place[]);
      })
    );
  }
}