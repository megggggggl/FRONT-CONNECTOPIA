// core/services/comment.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private api: ApiServicio) {}

  listarComentarios(postId?: string) {
    let url = '/comments';
    if (postId) url += `?post_id=${postId}`;
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  obtenerComentario(id: string) {
    return this.api.get<any>(`/comments/${id}`).pipe(timeout(8000));
  }

  crearComentario(data: any) {
    return this.api.post<any>('/comments', data).pipe(timeout(8000));
  }

  actualizarComentario(id: string, data: any) {
    return this.api.patch<any>(`/comments/${id}`, data).pipe(timeout(8000));
  }

  eliminarComentario(id: string) {
    return this.api.delete<any>(`/comments/${id}`).pipe(timeout(8000));
  }
}