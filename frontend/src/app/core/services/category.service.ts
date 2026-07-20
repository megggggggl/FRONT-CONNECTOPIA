import { Injectable } from '@angular/core';
import { timeout, catchError, of, map } from 'rxjs';
import { ApiServicio } from './api.servicio';

export interface Category {
  id: number;
  name: string;
  entity_type: 'service' | 'place' | 'event' | 'post';
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  message?: string;
  data: Category[];
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private api: ApiServicio) {}

  // ============================================================
  // LISTAR CATEGORÍAS (con filtro por entity_type opcional)
  // ============================================================
  listarCategorias(entityType?: string) {
  let url = '/categories';
  if (entityType) url += `?entity_type=${entityType}`;
  return this.api.get<any>(url).pipe(
    map((respuesta) => respuesta?.data || []),
    timeout(10000),
    catchError(() => of([]))
  );
}

  // ============================================================
  // OBTENER CATEGORÍA POR ID
  // ============================================================
  obtenerCategoria(id: number) {
    return this.api.get<Category>(`/categories/${id}`).pipe(
      timeout(8000),
      map((respuesta: any) => {
        return respuesta?.data || respuesta;
      }),
      catchError((error) => {
        console.error(`Error al obtener categoría ${id}:`, error);
        return of(null);
      })
    );
  }

  // ============================================================
  // CRUD DE CATEGORÍAS (para admin)
  // ============================================================
  crearCategoria(data: Partial<Category>) {
    return this.api.post<Category>('/categories', data).pipe(
      timeout(10000),
      map((respuesta: any) => respuesta?.data || respuesta)
    );
  }

  actualizarCategoria(id: number, data: Partial<Category>) {
    return this.api.patch<Category>(`/categories/${id}`, data).pipe(
      timeout(10000),
      map((respuesta: any) => respuesta?.data || respuesta)
    );
  }

  eliminarCategoria(id: number) {
    return this.api.delete<any>(`/categories/${id}`).pipe(
      timeout(8000),
      map((respuesta: any) => respuesta?.message || respuesta)
    );
  }

  // ============================================================
  // OBTENER CATEGORÍAS POR TIPO DE ENTIDAD
  // ============================================================
  getServiceCategories() {
    return this.listarCategorias('service');
  }

  getPlaceCategories() {
    return this.listarCategorias('place');
  }

  getEventCategories() {
    return this.listarCategorias('event');
  }

  getPostCategories() {
    return this.listarCategorias('post');
  }
}