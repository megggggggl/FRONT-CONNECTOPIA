import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError, timeout } from 'rxjs';

import { WebServices } from '../../core/services/webServices';
import {
  AccionHistorialCita,
  PayloadSolicitudCitaTelegram,
  RespuestaEnlaceTelegram,
  RespuestaListaSolicitudes,
  ServicioDisponibleCita,
  SolicitudCita
} from '../../compartido/modelos/appointment.model';

@Injectable({
  providedIn: 'root'
})

export class TelegramCitasService {
  private readonly telegramBotUsername = 'ConnectopiaHNBot';
  private readonly isBrowser: boolean;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
// En TelegramCitasService, agregar:
obtenerServiciosDisponibles(): Observable<ServicioDisponibleCita[]> {
  return this.http.get<ServicioDisponibleCita[]>(WebServices.ServicesAppointmentOptions).pipe(
    timeout(8000),
    map((respuesta: any) => {
      if (Array.isArray(respuesta)) return respuesta;
      if (respuesta && respuesta.data && Array.isArray(respuesta.data)) return respuesta.data;
      return [];
    }),
    catchError(() => of([]))
  );
}
  crearEnlaceVinculacion(): Observable<RespuestaEnlaceTelegram> {
    return this.http.post<RespuestaEnlaceTelegram>(
      WebServices.BotLinkToken,
      {},
      { headers: this.crearHeaders() }
    );
  }

  solicitarCita(serviceId: string): Observable<RespuestaEnlaceTelegram> {
    const payload: PayloadSolicitudCitaTelegram = {
      service_id: serviceId
    };

    return this.http.post<RespuestaEnlaceTelegram>(
      WebServices.BotAppointmentToken,
      payload,
      { headers: this.crearHeaders() }
    );
  }

  actualizarHistorialCita(
    citaId: string,
    action: AccionHistorialCita
  ): Observable<{ message?: string; action?: AccionHistorialCita; persisted?: boolean }> {
    return this.http.patch<{ message?: string; action?: AccionHistorialCita; persisted?: boolean }>(
      WebServices.AppointmentHistory(citaId),
      { action },
      { headers: this.crearHeaders() }
    ).pipe(
      tap(() => {
        if (action !== 'delete') {
          this.guardarHistorialLocal(citaId, action);
        }
      }),
      catchError((error: unknown) => {
        if (action !== 'delete') {
          this.guardarHistorialLocal(citaId, action);
          return of({
            message: 'Cita actualizada localmente.',
            action,
            persisted: false
          });
        }

        return throwError(() => error);
      })
    );
  }

  obtenerMisCitas(): Observable<SolicitudCita[]> {
    if (!this.obtenerToken()) return of([]);

    return this.http.get<SolicitudCita[] | RespuestaListaSolicitudes>(
      this.conCacheBust(WebServices.AppointmentsMe),
      { headers: this.crearHeaders() }
    ).pipe(
      map((respuesta) => this.extraerListaSolicitudes(respuesta)),
      switchMap((citas) => this.enriquecerCitasConServicios(citas)),
      map((citas) => this.filtrarHistorialLocal(citas))
    );
  }

  obtenerCitasPrestador(): Observable<SolicitudCita[]> {
    if (!this.obtenerToken()) return of([]);

    return this.http.get<SolicitudCita[] | RespuestaListaSolicitudes>(
      this.conCacheBust(WebServices.AppointmentsProvider),
      { headers: this.crearHeaders() }
    ).pipe(
      map((respuesta) => this.extraerListaSolicitudes(respuesta)),
      switchMap((citas) => this.enriquecerCitasConServicios(citas)),
      map((citas) => this.filtrarHistorialLocal(citas))
    );
  }

  extraerUrlTelegram(respuesta: RespuestaEnlaceTelegram | null | undefined): string {
    return respuesta?.url
      ?? respuesta?.link
      ?? respuesta?.data?.url
      ?? respuesta?.data?.link
      ?? '';
  }

  extraerComandoInicio(respuesta: RespuestaEnlaceTelegram | null | undefined): string {
    return respuesta?.start_command
      ?? respuesta?.data?.start_command
      ?? '';
  }

  extraerPayloadInicio(respuesta: RespuestaEnlaceTelegram | null | undefined): string {
    const comando = this.extraerComandoInicio(respuesta);
    const payloadComando = comando.match(/^\/start\s+(.+)$/i)?.[1]?.trim();
    if (payloadComando) return payloadComando;

    const url = this.extraerUrlTelegram(respuesta);
    if (!url) return '';

    try {
      return new URL(url).searchParams.get('start')?.trim() ?? '';
    } catch {
      const payloadUrl = url.match(/[?&]start=([^&]+)/)?.[1];
      return payloadUrl ? decodeURIComponent(payloadUrl).trim() : '';
    }
  }

  crearComandoInicioDesdePayload(payload: string): string {
    return payload ? `/start ${payload}` : '';
  }

  crearDeepLinkTelegramDesktop(payload: string): string {
    if (!payload) return '';

    const params = new URLSearchParams({
      domain: this.telegramBotUsername,
      start: payload
    });

    return `tg://resolve?${params.toString()}`;
  }

  crearLinkTelegramWeb(payload: string, urlBackend = ''): string {
    if (urlBackend) return urlBackend;
    if (!payload) return '';

    const params = new URLSearchParams({ start: payload });
    return `https://t.me/${this.telegramBotUsername}?${params.toString()}`;
  }

  abrirTelegramDesktop(deepLink: string): boolean {
    if (!this.isBrowser || !deepLink) return false;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    window.setTimeout(() => iframe.remove(), 1200);

    return true;
  }

  abrirTelegramWeb(url: string): boolean {
    if (!this.isBrowser || !url) return false;

    const ventana = window.open(url, '_blank', 'noopener,noreferrer');
    return Boolean(ventana);
  }

  abrirTelegram(url: string): boolean {
    if (!this.isBrowser || !url) return false;

    const ventana = window.open(url, '_blank', 'noopener,noreferrer');
    return Boolean(ventana);
  }

  abrirTelegramMismaPestana(url: string): boolean {
    return this.abrirTelegramWeb(url);
  }

  obtenerEtiquetaEstado(estado: string | null | undefined): string {
    const normalizado = String(estado ?? 'pending').trim().toLowerCase();

    const etiquetas: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Confirmada',
      rejected: 'Rechazada',
      delivery_failed: 'No se pudo contactar',
      cancelled: 'Cancelada',
      expired: 'Expirada'
    };

    return etiquetas[normalizado] ?? 'Pendiente';
  }

  obtenerClaseEstado(estado: string | null | undefined): string {
    const normalizado = String(estado ?? 'pending').trim().toLowerCase();

    if (['accepted', 'confirmed', 'confirmada', 'aceptada'].includes(normalizado)) {
      return 'estado-confirmada';
    }

    if (['rejected', 'rechazada'].includes(normalizado)) {
      return 'estado-rechazada';
    }

    if (['delivery_failed', 'cancelled', 'expired', 'fallida', 'cancelada', 'expirada'].includes(normalizado)) {
      return 'estado-fallida';
    }

    return 'estado-pendiente';
  }

  obtenerCodigoSolicitud(cita: SolicitudCita): string {
    return cita.id ? `#${String(cita.id).slice(0, 8).toUpperCase()}` : 'Sin codigo';
  }

  obtenerFechaHoraSolicitud(cita: SolicitudCita): string {
    const fecha = this.obtenerFechaPrincipal(cita);
    const hora = cita.requested_time ?? this.extraerHora(fecha);
    const fechaParseada = this.crearFecha(fecha, hora);

    if (!fechaParseada && hora) {
      return this.formatearHora(hora);
    }

    if (!fechaParseada) {
      return 'Sin fecha';
    }

    const fechaTexto = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(fechaParseada);
    const horaTexto = hora
      ? this.formatearHora(hora)
      : new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(fechaParseada);

    return `${fechaTexto} • ${horaTexto}`;
  }

  obtenerDireccionSolicitud(cita: SolicitudCita): string {
    return cita.address?.trim() || 'Sin direccion indicada';
  }

  obtenerDescripcionSolicitud(cita: SolicitudCita): string {
    return cita.description?.trim() || 'Sin descripcion indicada';
  }

  private extraerListaSolicitudes(
    respuesta: SolicitudCita[] | RespuestaListaSolicitudes | null | undefined
  ): SolicitudCita[] {
    if (!respuesta) return [];
    if (Array.isArray(respuesta)) return respuesta;

    return respuesta.data
      ?? respuesta.appointments
      ?? respuesta.items
      ?? respuesta.results
      ?? [];
  }

  private enriquecerCitasConServicios(citas: SolicitudCita[]): Observable<SolicitudCita[]> {
    if (citas.length === 0) return of([]);

    return forkJoin(
      citas.map((cita) => this.enriquecerCitaConServicio(cita))
    );
  }

  private enriquecerCitaConServicio(cita: SolicitudCita): Observable<SolicitudCita> {
    if (!cita.service_id || cita.service?.name) {
      return of(cita);
    }

    return this.http.get<any>(
      this.conCacheBust(WebServices.ServiceGet(cita.service_id)),
      { headers: this.crearHeaders() }
    ).pipe(
      timeout(8000),
      map((servicio) => ({
        ...cita,
        service: {
          id: servicio?.id ?? cita.service_id ?? undefined,
          name: servicio?.name ?? cita.service?.name,
          title: servicio?.title ?? servicio?.name ?? cita.service?.title
        },
        provider: cita.provider ?? servicio?.provider ?? null
      })),
      catchError(() => of(cita))
    );
  }

  private obtenerFechaPrincipal(cita: SolicitudCita): string | null {
    return cita.requested_date
      ?? cita.scheduled_at
      ?? cita.requested_at
      ?? cita.created_at
      ?? null;
  }

  private crearFecha(fecha: string | null, hora: string | null | undefined): Date | null {
    if (!fecha) return null;

    const fechaTexto = String(fecha).trim();
    const horaTexto = this.normalizarHora(hora);
    const valor = /^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)
      ? `${fechaTexto}T${horaTexto || '00:00:00'}`
      : fechaTexto;
    const fechaParseada = new Date(valor);

    if (Number.isNaN(fechaParseada.getTime())) return null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto) && horaTexto) {
      const [horas, minutos] = horaTexto.split(':').map((parte) => Number(parte));
      fechaParseada.setHours(horas, minutos, 0, 0);
    }

    return fechaParseada;
  }

  private extraerHora(fecha: string | null): string | null {
    if (!fecha || /^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) return null;

    const fechaParseada = new Date(fecha);
    if (Number.isNaN(fechaParseada.getTime())) return null;

    return [
      String(fechaParseada.getHours()).padStart(2, '0'),
      String(fechaParseada.getMinutes()).padStart(2, '0'),
      '00'
    ].join(':');
  }

  private formatearHora(hora: string): string {
    const horaTexto = this.normalizarHora(hora);
    if (!horaTexto) return 'Sin hora';

    const [horas, minutos] = horaTexto.split(':').map((parte) => Number(parte));
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(fecha);
  }

  private normalizarHora(hora: string | null | undefined): string {
    const match = String(hora ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return '';

    const horas = Number(match[1]);
    const minutos = Number(match[2]);
    if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return '';

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
  }

  private filtrarHistorialLocal(citas: SolicitudCita[]): SolicitudCita[] {
    const historial = this.obtenerHistorialLocal();
    return citas.filter((cita) => {
      return !historial.hidden[cita.id] && !historial.archived[cita.id];
    });
  }

  private guardarHistorialLocal(citaId: string, action: AccionHistorialCita): void {
    if (!this.isBrowser || action === 'delete') return;

    const historial = this.obtenerHistorialLocal();
    const bucket = action === 'hide' ? 'hidden' : 'archived';
    historial[bucket][citaId] = new Date().toISOString();

    localStorage.setItem(this.obtenerClaveHistorialLocal(), JSON.stringify(historial));
  }

  private obtenerHistorialLocal(): {
    hidden: Record<string, string>;
    archived: Record<string, string>;
  } {
    if (!this.isBrowser) return { hidden: {}, archived: {} };

    try {
      const valor = JSON.parse(localStorage.getItem(this.obtenerClaveHistorialLocal()) || '{}');
      return {
        hidden: valor.hidden && typeof valor.hidden === 'object' ? valor.hidden : {},
        archived: valor.archived && typeof valor.archived === 'object' ? valor.archived : {}
      };
    } catch {
      return { hidden: {}, archived: {} };
    }
  }

  private obtenerClaveHistorialLocal(): string {
    const usuario = this.obtenerUsuarioLocal();
    return `connectopia_appointment_history_${usuario?.id ?? 'anon'}`;
  }

  private obtenerUsuarioLocal(): { id?: string } | null {
    if (!this.isBrowser) return null;

    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  private crearHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };

    if (this.isBrowser) {
      const token = this.obtenerToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return new HttpHeaders(headers);
  }

  private obtenerToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
  }

  private conCacheBust(url: string): string {
    const separador = url.includes('?') ? '&' : '?';
    return `${url}${separador}_t=${Date.now()}`;
  }
  
}
