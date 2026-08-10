// src/app/core/services/reaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  constructor(private http: HttpClient) {}

  // Obtener reacciones de un post
  getReactions(postId: string): Observable<any[]> {
    return this.http.get<any[]>(`${WebServices.ReactionsList}?post_id=${postId}`);
  }

  // Agregar o cambiar reacción
  toggleReaction(postId: string, type: string): Observable<any> {
    return this.http.post(WebServices.ReactionsCreate, {
      post_id: postId,
      reaction_type: type
    });
  }

  // Eliminar reacción
  removeReaction(reactionId: string): Observable<void> {
    return this.http.delete<void>(WebServices.ReactionDelete(reactionId));
  }
}