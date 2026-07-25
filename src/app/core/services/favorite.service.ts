// core/services/favorite.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  constructor(private api: ApiServicio) {}

  listarFavoritos() {
    return this.api.get<any[]>('/favorites').pipe(timeout(8000));
  }

  agregarFavorito(entityType: string, entityId: string) {
    return this.api.post<any>('/favorites', { entity_type: entityType, entity_id: entityId }).pipe(timeout(8000));
  }

  eliminarFavorito(id: string) {
    return this.api.delete<any>(`/favorites/${id}`).pipe(timeout(8000));
  }
}