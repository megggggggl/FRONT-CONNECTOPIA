import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusRoute, BusStop } from '../models/bus-route.model';
import { WebServices } from './webServices';

@Injectable({ providedIn: 'root' })
export class BusRouteService {
  constructor(private http: HttpClient) {}

  // ===== RUTAS =====
  listarRutas(params?: { origin?: string; destination?: string }): Observable<BusRoute[]> {
    let url = WebServices.BusRoutesList;
    const query = [];
    if (params?.origin) query.push(`origin=${encodeURIComponent(params.origin)}`);
    if (params?.destination) query.push(`destination=${encodeURIComponent(params.destination)}`);
    if (query.length) url += `?${query.join('&')}`;
    return this.http.get<BusRoute[]>(url);
  }

  obtenerRuta(id: string): Observable<BusRoute> {
    return this.http.get<BusRoute>(WebServices.BusRouteGet(id));
  }

  crearRuta(ruta: Partial<BusRoute>): Observable<BusRoute> {
    return this.http.post<BusRoute>(WebServices.BusRoutesCreate, ruta);
  }

  actualizarRuta(id: string, ruta: Partial<BusRoute>): Observable<BusRoute> {
    return this.http.patch<BusRoute>(WebServices.BusRouteUpdate(id), ruta);
  }

  eliminarRuta(id: string): Observable<void> {
    return this.http.delete<void>(WebServices.BusRouteDelete(id));
  }

  // ===== PARADAS =====
  listarParadas(params?: { city?: string; search?: string }): Observable<BusStop[]> {
    let url = WebServices.BusStopsList;
    const query = [];
    if (params?.city) query.push(`city=${encodeURIComponent(params.city)}`);
    if (params?.search) query.push(`search=${encodeURIComponent(params.search)}`);
    if (query.length) url += `?${query.join('&')}`;
    return this.http.get<BusStop[]>(url);
  }

  crearParada(parada: Partial<BusStop>): Observable<BusStop> {
    return this.http.post<BusStop>(WebServices.BusStopsCreate, parada);
  }

  // ===== RELACIÓN PARADA-RUTA =====
  agregarParadaARuta(routeId: string, stopId: string, orderIndex: number): Observable<any> {
    return this.http.post(WebServices.BusStopRoutesCreate, {
      route_id: routeId,
      bus_stop_id: stopId,
      order_index: orderIndex
    });
  }

  eliminarParadaDeRuta(routeId: string, stopId: string): Observable<void> {
    return this.http.delete<void>(`${WebServices.BusStopRoutesList}?route_id=${routeId}&bus_stop_id=${stopId}`);
  }
}