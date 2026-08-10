import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';
import { Favorite } from '../models/favorite.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  constructor(private http: HttpClient) {}

  listarFavoritos(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(WebServices.FavoritesList);
  }

  agregarFavorito(entityType: string, entityId: string): Observable<Favorite> {
    return this.http.post<Favorite>(WebServices.FavoritesAdd, { entity_type: entityType, entity_id: entityId });
  }

  eliminarFavorito(id: number | string): Observable<any> {
    return this.http.delete(WebServices.FavoritesRemove(id));
  }
}