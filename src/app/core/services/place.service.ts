// src/app/core/services/place.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Place } from '../models/place.model';
import { WebServices } from './webServices';

export interface PlaceFilters {
  category_id?: number;
  search?: string;
  featured?: boolean;
  cerca?: {
    lat: number;
    lng: number;
    radio?: number; // en metros, por defecto 5000
  };
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'created_at' | 'avg_rating' | 'distance';
  orderDir?: 'asc' | 'desc';
}

export interface PlaceResponse {
  data: Place[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PlaceService {
  private readonly defaultTimeout = 15000; // 15 segundos

  constructor(private http: HttpClient) {}

  /**
   * LISTAR LUGARES TURÍSTICOS
   * @param filters - Filtros opcionales
   * @returns Observable con array de Places
   */
  listarLugares(filters?: PlaceFilters): Observable<Place[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category_id) {
        params = params.set('category_id', filters.category_id.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.featured !== undefined) {
        params = params.set('featured', filters.featured.toString());
      }
      if (filters.cerca) {
        params = params.set('lat', filters.cerca.lat.toString());
        params = params.set('lng', filters.cerca.lng.toString());
        if (filters.cerca.radio) {
          params = params.set('radio', filters.cerca.radio.toString());
        }
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.orderBy) {
        params = params.set('orderBy', filters.orderBy);
      }
      if (filters.orderDir) {
        params = params.set('orderDir', filters.orderDir);
      }
    }

    return this.http.get<PlaceResponse>(WebServices.PlacesList, { params })
      .pipe(
        timeout(this.defaultTimeout),
        map((response) => {
          // Manejar diferentes estructuras de respuesta
          if (response && Array.isArray(response)) {
            return response;
          }
          if (response && response.data && Array.isArray(response.data)) {
            return response.data;
          }
          return [];
        }),
        catchError((error) => {
          console.error('❌ Error al listar lugares:', error);
          return throwError(() => new Error('No se pudieron cargar los lugares turísticos'));
        })
      );
  }

  /**
   * OBTENER LUGAR POR ID
   * @param id - UUID del lugar
   * @returns Observable con el Place completo
   */
  obtenerLugar(id: string): Observable<Place> {
    return this.http.get<Place>(WebServices.PlaceGet(id))
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => {
          console.error(`❌ Error al obtener lugar ${id}:`, error);
          return throwError(() => new Error('No se pudo cargar el lugar turístico'));
        })
      );
  }

  /**
   * CREAR LUGAR TURÍSTICO
   * @param lugar - Datos del lugar (Partial<Place>)
   * @returns Observable con el Place creado
   */
  crearLugar(lugar: Partial<Place>): Observable<Place> {
    return this.http.post<Place>(WebServices.PlacesCreate, lugar)
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => {
          console.error('❌ Error al crear lugar:', error);
          return throwError(() => new Error('No se pudo crear el lugar turístico'));
        })
      );
  }

  /**
   * ACTUALIZAR LUGAR TURÍSTICO
   * @param id - UUID del lugar
   * @param lugar - Datos a actualizar (Partial<Place>)
   * @returns Observable con el Place actualizado
   */
  actualizarLugar(id: string, lugar: Partial<Place>): Observable<Place> {
    return this.http.patch<Place>(WebServices.PlaceUpdate(id), lugar)
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => {
          console.error(`❌ Error al actualizar lugar ${id}:`, error);
          return throwError(() => new Error('No se pudo actualizar el lugar turístico'));
        })
      );
  }

  /**
   * ELIMINAR LUGAR TURÍSTICO (soft delete)
   * @param id - UUID del lugar
   * @returns Observable<void>
   */
  eliminarLugar(id: string): Observable<void> {
    return this.http.delete<void>(WebServices.PlaceDelete(id))
      .pipe(
        timeout(this.defaultTimeout),
        catchError((error) => {
          console.error(`❌ Error al eliminar lugar ${id}:`, error);
          return throwError(() => new Error('No se pudo eliminar el lugar turístico'));
        })
      );
  }

  /**
   * OBTENER LUGARES CERCANOS (versión simplificada)
   * @param lat - Latitud
   * @param lng - Longitud
   * @param radio - Radio en metros (por defecto 5000)
   * @returns Observable con array de Places cercanos
   */
  lugaresCercanos(lat: number, lng: number, radio: number = 5000): Observable<Place[]> {
    return this.listarLugares({
      cerca: { lat, lng, radio },
      orderBy: 'distance',
      orderDir: 'asc'
    });
  }

  /**
   * OBTENER LUGARES DESTACADOS
   * @param limit - Cantidad máxima (por defecto 6)
   * @returns Observable con array de Places destacados
   */
  lugaresDestacados(limit: number = 6): Observable<Place[]> {
    return this.listarLugares({
      featured: true,
      limit,
      orderBy: 'avg_rating',
      orderDir: 'desc'
    });
  }

  /**
   * BUSCAR LUGARES POR TEXTO
   * @param query - Término de búsqueda
   * @param limit - Cantidad máxima (por defecto 20)
   * @returns Observable con array de Places que coinciden
   */
  buscarLugares(query: string, limit: number = 20): Observable<Place[]> {
    return this.listarLugares({
      search: query,
      limit
    });
  }

  /**
   * OBTENER LUGARES POR CATEGORÍA
   * @param categoryId - ID de la categoría
   * @param limit - Cantidad máxima (por defecto 20)
   * @returns Observable con array de Places de esa categoría
   */
  lugaresPorCategoria(categoryId: number, limit: number = 20): Observable<Place[]> {
    return this.listarLugares({
      category_id: categoryId,
      limit
    });
  }
}