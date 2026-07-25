// core/services/profile.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiServicio) {}

  obtenerUsuarioActual() {
    return this.api.get<any>('/auth/me').pipe(timeout(8000));
  }

  actualizarPerfil(idPerfil: string, datos: any) {
    return this.api.patch<any>(`/profiles/${idPerfil}`, datos).pipe(timeout(8000));
  }

  obtenerPerfilPorId(id: string) {
    return this.api.get<any>(`/profiles/${id}`).pipe(timeout(8000));
  }

  listarPerfiles(filtros?: any) {
    let url = '/profiles';
    if (filtros) {
      const params = new URLSearchParams(filtros).toString();
      if (params) url += `?${params}`;
    }
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }
}