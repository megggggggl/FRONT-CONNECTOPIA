// core/services/event.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: ApiServicio) {}

  listarEventos(filtros?: { status?: string; category?: number; search?: string }) {
    let url = '/events';
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.category) params.set('category_id', String(filtros.category));
      if (filtros.search) params.set('search', filtros.search);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  obtenerEvento(id: string) {
    return this.api.get<any>(`/events/${id}`).pipe(timeout(8000));
  }

  crearEvento(data: any) {
    return this.api.post<any>('/events', data).pipe(timeout(8000));
  }

  actualizarEvento(id: string, data: any) {
    return this.api.patch<any>(`/events/${id}`, data).pipe(timeout(8000));
  }

  eliminarEvento(id: string) {
    return this.api.delete<any>(`/events/${id}`).pipe(timeout(8000));
  }

  // Registrarse a un evento
  registrarse(id: string) {
    return this.api.post<any>(`/events/${id}/register`, {}).pipe(timeout(8000));
  }

  // Cancelar registro
  cancelarRegistro(id: string) {
    return this.api.delete<any>(`/events/${id}/register`).pipe(timeout(8000));
  }
}