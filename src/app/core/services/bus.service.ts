// core/services/bus.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class BusService {
  constructor(private api: ApiServicio) {}

  // ============================================================
  // PARADAS
  // ============================================================
  listarParadas(filtros?: { city?: string; zone?: string; search?: string }) {
    let url = '/bus-stops';
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.city) params.set('city', filtros.city);
      if (filtros.zone) params.set('zone', filtros.zone);
      if (filtros.search) params.set('search', filtros.search);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  obtenerParada(id: string) {
    return this.api.get<any>(`/bus-stops/${id}`).pipe(timeout(8000));
  }

  crearParada(data: any) {
    return this.api.post<any>('/bus-stops', data).pipe(timeout(8000));
  }

  actualizarParada(id: string, data: any) {
    return this.api.patch<any>(`/bus-stops/${id}`, data).pipe(timeout(8000));
  }

  eliminarParada(id: string) {
    return this.api.delete<any>(`/bus-stops/${id}`).pipe(timeout(8000));
  }

  // ============================================================
  // RUTAS
  // ============================================================
  listarRutas() {
    return this.api.get<any[]>('/bus-routes').pipe(timeout(8000));
  }

  obtenerRuta(id: number) {
    return this.api.get<any>(`/bus-routes/${id}`).pipe(timeout(8000));
  }

  crearRuta(data: any) {
    return this.api.post<any>('/bus-routes', data).pipe(timeout(8000));
  }

  actualizarRuta(id: number, data: any) {
    return this.api.patch<any>(`/bus-routes/${id}`, data).pipe(timeout(8000));
  }

  eliminarRuta(id: number) {
    return this.api.delete<any>(`/bus-routes/${id}`).pipe(timeout(8000));
  }

  // ============================================================
  // RELACIONES PARADA-RUTA
  // ============================================================
  listarRelaciones(busStopId?: string, routeId?: number) {
    let url = '/bus-stop-routes';
    const params = new URLSearchParams();
    if (busStopId) params.set('bus_stop_id', busStopId);
    if (routeId) params.set('route_id', String(routeId));
    const query = params.toString();
    if (query) url += `?${query}`;
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  crearRelacion(data: { bus_stop_id: string; route_id: number; order_index: number }) {
    return this.api.post<any>('/bus-stop-routes', data).pipe(timeout(8000));
  }

  eliminarRelacion(busStopId: string, routeId: number) {
    return this.api.delete<any>(`/bus-stop-routes?bus_stop_id=${busStopId}&route_id=${routeId}`).pipe(timeout(8000));
  }
}