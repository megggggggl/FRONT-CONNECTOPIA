// core/services/reaction.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  constructor(private api: ApiServicio) {}

  listarReacciones() {
    return this.api.get<any[]>('/reactions').pipe(timeout(8000));
  }

  crearReaccion(data: { post_id: string; reaction_type: string }) {
    return this.api.post<any>('/reactions', data).pipe(timeout(8000));
  }

  eliminarReaccion(id: string) {
    return this.api.delete<any>(`/reactions/${id}`).pipe(timeout(8000));
  }
}