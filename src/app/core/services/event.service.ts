import { Injectable } from '@angular/core';
import { Observable, map, catchError, of, timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

// ============================================================
// INTERFACES
// ============================================================
export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location: any;
  address: string | null;
  start_date: string;
  end_date: string | null;
  category_id: number | null;
  images: string[];
  max_participants: number | null;
  current_participants: number;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  organizer?: any;
  category?: any;
}

export interface EventResponse {
  message?: string;
  data: Event[];
}

export interface EventSingleResponse {
  message?: string;
  data: Event;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: ApiServicio) {}

  // ============================================================
  // LISTAR EVENTOS (con filtros opcionales)
  // ============================================================
  listarEventos(filtros?: { status?: string; category?: number; search?: string }): Observable<Event[]> {
    let url = '/events';
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.category) params.set('category_id', String(filtros.category));
      if (filtros.search) params.set('search', filtros.search);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return this.api.get<EventResponse>(url).pipe(
      map((respuesta) => {
        console.log('📦 Respuesta cruda de /events:', respuesta);
        const data = respuesta?.data || [];
        console.log('✅ Extraído data de eventos:', data);
        return data;
      }),
      timeout(10000),
      catchError((error) => {
        console.error('❌ Error al listar eventos:', error);
        return of([] as Event[]);
      })
    );
  }

  // ============================================================
  // OBTENER EVENTO POR ID
  // ============================================================
  obtenerEvento(id: string): Observable<Event | null> {
    return this.api.get<EventSingleResponse>(`/events/${id}`).pipe(
      map((respuesta) => respuesta?.data || null),
      timeout(8000),
      catchError((error) => {
        console.error(`❌ Error al obtener evento ${id}:`, error);
        return of(null);
      })
    );
  }

  // ============================================================
  // CREAR EVENTO (solo admin)
  // ============================================================
  crearEvento(data: Partial<Event>): Observable<Event> {
    return this.api.post<EventSingleResponse>('/events', data).pipe(
      map((respuesta) => respuesta?.data || ({} as Event)),
      timeout(10000),
      catchError((error) => {
        console.error('❌ Error al crear evento:', error);
        throw error;
      })
    );
  }

  // ============================================================
  // ACTUALIZAR EVENTO (solo admin)
  // ============================================================
  actualizarEvento(id: string, data: Partial<Event>): Observable<Event> {
    return this.api.patch<EventSingleResponse>(`/events/${id}`, data).pipe(
      map((respuesta) => respuesta?.data || ({} as Event)),
      timeout(10000),
      catchError((error) => {
        console.error(`❌ Error al actualizar evento ${id}:`, error);
        throw error;
      })
    );
  }

  // ============================================================
  // ELIMINAR EVENTO (solo admin)
  // ============================================================
  eliminarEvento(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/events/${id}`).pipe(
      timeout(8000),
      catchError((error) => {
        console.error(`❌ Error al eliminar evento ${id}:`, error);
        throw error;
      })
    );
  }

// event.service.ts
registrarse(eventoId: string): Observable<any> {
  return this.api.post(`/events/${eventoId}/participate`, {});
}

cancelarRegistro(eventoId: string): Observable<any> {
  return this.api.delete(`/events/${eventoId}/participate`);
}

  // ============================================================
  // OBTENER EVENTOS DEL USUARIO (inscritos)
  // ============================================================
  obtenerEventosInscritos(): Observable<Event[]> {
    return this.api.get<EventResponse>('/events/inscritos').pipe(
      map((respuesta) => respuesta?.data || []),
      timeout(8000),
      catchError((error) => {
        console.error('❌ Error al obtener eventos inscritos:', error);
        return of([] as Event[]);
      })
    );
  }

  // ============================================================
  // OBTENER EVENTOS DEL ORGANIZADOR
  // ============================================================
  obtenerEventosOrganizador(organizerId: string): Observable<Event[]> {
    return this.api.get<EventResponse>(`/events?organizer_id=${organizerId}`).pipe(
      map((respuesta) => respuesta?.data || []),
      timeout(8000),
      catchError((error) => {
        console.error(`❌ Error al obtener eventos del organizador ${organizerId}:`, error);
        return of([] as Event[]);
      })
    );
  }

  // ============================================================
  // OBTENER EVENTOS ACTIVOS (no cancelados ni finalizados)
  // ============================================================
  obtenerEventosActivos(): Observable<Event[]> {
    return this.listarEventos().pipe(
      map((eventos) => eventos.filter(
        (e) => e.status !== 'cancelado' && e.status !== 'finalizado'
      ))
    );
  }

  // ============================================================
  // BUSCAR EVENTOS POR TEXTO
  // ============================================================
  buscarEventos(query: string): Observable<Event[]> {
    return this.listarEventos({ search: query });
  }

  // ============================================================
  // OBTENER EVENTOS POR ESTADO
  // ============================================================
  obtenerEventosPorEstado(status: string): Observable<Event[]> {
    return this.listarEventos({ status });
  }
  rsvpEvent(eventId: string, status: 'interested' | 'attending' | 'not_attending'): Observable<any> {
  return this.api.post(`/events/${eventId}/rsvp`, { status });
}

getUserRsvp(eventId: string): Observable<{ status: string }> {
  return this.api.get(`/events/${eventId}/rsvp`);
}

getEventRsvpCounts(eventId: string): Observable<{ total: number; confirmados: number; interesados: number; cancelados: number }> {
  return this.api.get(`/events/${eventId}/rsvp-counts`);
}
}