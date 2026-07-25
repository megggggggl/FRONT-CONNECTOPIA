// core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private api: ApiServicio) {}

  listarNotificaciones() {
    return this.api.get<any[]>('/notifications').pipe(timeout(8000));
  }

  obtenerNotificacion(id: string) {
    return this.api.get<any>(`/notifications/${id}`).pipe(timeout(8000));
  }

  marcarComoLeida(id: string) {
    return this.api.patch<any>(`/notifications/${id}/read`, {}).pipe(timeout(8000));
  }

  marcarTodasComoLeidas() {
    return this.api.patch<any>('/notifications/read-all', {}).pipe(timeout(8000));
  }

  contarNoLeidas() {
    return this.api.get<{ count: number }>('/notifications/unread-count').pipe(timeout(8000));
  }
}