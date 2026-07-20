// core/services/post.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private api: ApiServicio) {}

  listarPosts(filtros?: { type?: string; category?: number; status?: string }) {
    let url = '/posts';
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.type) params.set('type', filtros.type);
      if (filtros.category) params.set('category_id', String(filtros.category));
      if (filtros.status) params.set('status', filtros.status);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  obtenerPost(id: string) {
    return this.api.get<any>(`/posts/${id}`).pipe(timeout(8000));
  }

  crearPost(data: any) {
    return this.api.post<any>('/posts', data).pipe(timeout(8000));
  }

  actualizarPost(id: string, data: any) {
    return this.api.patch<any>(`/posts/${id}`, data).pipe(timeout(8000));
  }

  eliminarPost(id: string) {
    return this.api.delete<any>(`/posts/${id}`).pipe(timeout(8000));
  }
}