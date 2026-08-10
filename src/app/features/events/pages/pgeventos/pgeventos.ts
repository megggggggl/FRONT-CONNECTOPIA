import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { WebServices } from '../../../../core/services/webServices';

const DASHBOARD_CACHE_KEY = 'connectopia.dashboard.stats';

interface RespuestaLista<T> {
  message?: string;
  data?: T[];
  events?: T[];
  items?: T[];
  results?: T[];
  error?: string;
}

interface RespuestaEvento {
  message?: string;
  data?: Evento;
  event?: Evento;
  events?: Evento[];
  error?: string;
}

interface Evento {
  id: string;
  organizer_id?: string;
  title: string;
  description: string | null;
  address: string | null;
  start_date: string;
  end_date: string | null;
  category_id: number | null;
  images: string[];
  max_participants: number | null;
  current_participants: number | null;
  status: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface OpcionEstado {
  value: string;
  label: string;
}

interface EventoForm {
  title: string;
  description: string;
  address: string;
  start_date: string;
  end_date: string;
  category_id: string;
  images: string;
  max_participants: string;
  status: string;
}

@Component({
  selector: 'app-pgeventos',
  imports: [CommonModule, FormsModule, MainLayout],
  templateUrl: './pgeventos.html',
  styleUrl: './pgeventos.css',
})
export class Pgeventos implements OnInit {
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  busqueda = '';
  filtroEstado = 'todos';

  cargando = false;
  guardando = false;
  error = '';
  exito = '';
  eliminandoId: string | null = null;

  modalAbierto = false;
  confirmacionEliminarAbierta = false;
  editandoId: string | null = null;
  eventoPendienteEliminar: Evento | null = null;

  form: EventoForm = this.crearFormulario();

  readonly estados: OpcionEstado[] = [
    { value: 'programado', label: 'Programado' },
    { value: 'en_curso', label: 'Activo' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  get eventosActivos(): number {
    return this.eventos.filter((evento) => this.normalizarEstado(evento.status) === 'en_curso').length;
  }

  get eventosPendientes(): number {
    return this.eventos.filter((evento) => this.normalizarEstado(evento.status) === 'programado').length;
  }

  get eventosFinalizados(): number {
    return this.eventos.filter((evento) => this.normalizarEstado(evento.status) === 'finalizado').length;
  }

  get totalParticipantes(): number {
    return this.eventos.reduce(
      (total, evento) => total + Number(evento.current_participants ?? 0),
      0
    );
  }

  get proximoEvento(): Evento | null {
    const ahora = Date.now();

    return this.eventos
      .filter((evento) => new Date(evento.start_date).getTime() >= ahora)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0] ?? null;
  }

  cargarEventos(mostrarLoading = true): void {
    if (mostrarLoading) {
      this.cargando = true;
    }
    this.error = '';

    this.http.get<Evento[] | RespuestaLista<Evento>>(WebServices.EventsList, {
      headers: this.crearHeaders()
    }).pipe(
      finalize(() => {
        if (mostrarLoading) {
          this.cargando = false;
        }
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (respuesta) => {
        this.eventos = this.extraerLista(respuesta);
        this.aplicarFiltros();
        this.sincronizarEventosEnCacheDashboard();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        this.error = this.obtenerMensajeError(error, 'No se pudieron cargar los eventos.');
        if (mostrarLoading) {
          this.eventos = [];
          this.aplicarFiltros();
        }
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();
    const estado = this.filtroEstado;

    this.eventosFiltrados = this.eventos.filter((evento) => {
      const coincideTexto =
        !texto ||
        evento.title.toLowerCase().includes(texto) ||
        String(evento.description ?? '').toLowerCase().includes(texto) ||
        String(evento.address ?? '').toLowerCase().includes(texto);

      const coincideEstado = estado === 'todos' || this.normalizarEstado(evento.status) === estado;

      return coincideTexto && coincideEstado;
    });
    this.cdr.detectChanges();
  }

  abrirCrear(): void {
    this.editandoId = null;
    this.form = this.crearFormulario();
    this.error = '';
    this.exito = '';
    this.modalAbierto = true;
  }

  abrirEditar(evento: Evento): void {
    this.editandoId = evento.id;
    this.form = {
      title: evento.title ?? '',
      description: evento.description ?? '',
      address: evento.address ?? '',
      start_date: this.formatearParaInput(evento.start_date),
      end_date: this.formatearParaInput(evento.end_date),
      category_id: evento.category_id == null ? '' : String(evento.category_id),
      images: (evento.images ?? []).join(', '),
      max_participants: evento.max_participants == null ? '' : String(evento.max_participants),
      status: this.normalizarEstado(evento.status)
    };
    this.error = '';
    this.exito = '';
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.editandoId = null;
    this.form = this.crearFormulario();
  }

  guardarEvento(): void {
    const payload = this.crearPayload();
    const editandoIdActual = this.editandoId;

    if (!payload.title || !payload.start_date) {
      this.error = 'Titulo y fecha de inicio son obligatorios.';
      return;
    }

    const token = this.obtenerToken();
    if (!token) {
      this.error = 'Inicia sesion como admin para guardar eventos.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.exito = '';

    const peticion = editandoIdActual
      ? this.http.patch<Evento | RespuestaEvento>(
          WebServices.EventUpdate(editandoIdActual),
          payload,
          { headers: this.crearHeaders(token) }
        )
      : this.http.post<Evento | RespuestaEvento>(
          WebServices.EventsCreate,
          payload,
          { headers: this.crearHeaders(token) }
        );

    peticion.pipe(
      finalize(() => {
        this.guardando = false;
      })
    ).subscribe({
      next: (respuesta) => {
        const error = this.extraerError(respuesta);
        if (error) {
          this.error = error;
          return;
        }

        this.exito = editandoIdActual ? 'Evento actualizado.' : 'Evento creado.';
        const eventoGuardado = this.extraerEvento(respuesta)
          ?? this.crearEventoLocalDesdePayload(payload, editandoIdActual);

        if (eventoGuardado) {
          this.actualizarEventoLocal(eventoGuardado, editandoIdActual == null);
          this.sincronizarEventosEnCacheDashboard();
        } else {
          this.cargarEventos(false);
        }

        this.cerrarModal();
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        this.error = this.obtenerMensajeError(error, 'No se pudo guardar el evento.');
      }
    });
  }

  abrirConfirmacionEliminar(evento: Evento): void {
    this.eventoPendienteEliminar = evento;
    this.confirmacionEliminarAbierta = true;
    this.error = '';
    this.exito = '';
  }

  cerrarConfirmacionEliminar(): void {
    if (this.eliminandoId) return;

    this.confirmacionEliminarAbierta = false;
    this.eventoPendienteEliminar = null;
  }

  confirmarEliminarEvento(): void {
    const evento = this.eventoPendienteEliminar;
    if (!evento) {
      this.cerrarConfirmacionEliminar();
      return;
    }

    const token = this.obtenerToken();
    if (!token) {
      this.error = 'Inicia sesion como admin para eliminar eventos.';
      return;
    }

    this.eliminandoId = evento.id;
    this.error = '';
    this.exito = '';

    this.http.delete(WebServices.EventDelete(evento.id), {
      headers: this.crearHeaders(token)
    }).pipe(
      finalize(() => {
        this.eliminandoId = null;
      })
    ).subscribe({
      next: () => {
        this.exito = 'Evento eliminado.';
        this.eventos = this.eventos.filter((item) => item.id !== evento.id);
        this.aplicarFiltros();
        this.sincronizarEventosEnCacheDashboard();
        this.confirmacionEliminarAbierta = false;
        this.eventoPendienteEliminar = null;
      },
      error: (error: unknown) => {
        this.error = this.obtenerMensajeError(error, 'No se pudo eliminar el evento.');
      }
    });
  }

  trackById(_: number, evento: Evento): string {
    return evento.id;
  }

  obtenerEstadoClase(evento: Evento): string {
    return `status ${this.normalizarEstado(evento.status)}`;
  }

  obtenerEtiquetaEstado(estado: string | null | undefined): string {
    const normalizado = this.normalizarEstado(estado);
    return this.estados.find((opcion) => opcion.value === normalizado)?.label
      ?? (normalizado === 'inactive' ? 'Inactivo' : 'Activo');
  }

  obtenerImagen(evento: Evento): string {
    return evento.images?.[0] || 'eventos.png';
  }

  obtenerCupo(evento: Evento): string {
    const actual = Number(evento.current_participants ?? 0);
    return evento.max_participants == null
      ? `${actual} / sin limite`
      : `${actual} / ${evento.max_participants}`;
  }

  private crearFormulario(): EventoForm {
    return {
      title: '',
      description: '',
      address: '',
      start_date: '',
      end_date: '',
      category_id: '',
      images: '',
      max_participants: '',
      status: 'programado'
    };
  }

  private crearPayload(): Partial<Evento> {
    const categoryId = Number(this.form.category_id);
    const maxParticipants = Number(this.form.max_participants);

    return {
      title: this.form.title.trim(),
      description: this.form.description.trim() || null,
      address: this.form.address.trim() || null,
      start_date: this.form.start_date,
      end_date: this.form.end_date || null,
      category_id: Number.isFinite(categoryId) && this.form.category_id ? categoryId : null,
      images: this.form.images
        .split(',')
        .map((imagen) => imagen.trim())
        .filter(Boolean),
      max_participants: Number.isFinite(maxParticipants) && this.form.max_participants
        ? maxParticipants
        : null,
      status: this.estadoParaBackend(this.form.status)
    };
  }

  private extraerLista(respuesta: Evento[] | RespuestaLista<Evento>): Evento[] {
    const lista = Array.isArray(respuesta)
      ? respuesta
      : respuesta.data ?? respuesta.events ?? respuesta.items ?? respuesta.results ?? [];

    return lista.filter((evento) => !evento.deleted_at);
  }

  private extraerEvento(respuesta: Evento | RespuestaEvento): Evento | null {
    if (!respuesta || typeof respuesta !== 'object') return null;
    if ('data' in respuesta && respuesta.data) return respuesta.data;
    if ('event' in respuesta && respuesta.event) return respuesta.event;
    if ('events' in respuesta && Array.isArray(respuesta.events)) return respuesta.events[0] ?? null;
    return 'id' in respuesta ? respuesta as Evento : null;
  }

  private actualizarEventoLocal(evento: Evento, esNuevo: boolean): void {
    const existe = this.eventos.some((item) => item.id === evento.id);

    if (existe) {
      this.eventos = this.eventos.map((item) => item.id === evento.id ? evento : item);
    } else if (esNuevo) {
      this.eventos = [evento, ...this.eventos];
    }

    this.aplicarFiltros();
  }

  private sincronizarEventosEnCacheDashboard(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
      const cache = raw ? JSON.parse(raw) as { content?: { events?: number }; updatedAt?: string } : {};
      const actualizado = {
        ...cache,
        content: {
          ...cache.content,
          events: this.eventos.length
        },
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(actualizado));
      window.dispatchEvent(new CustomEvent('connectopia:dashboard-stats-updated', {
        detail: actualizado
      }));
    } catch {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
    }
  }

  private crearEventoLocalDesdePayload(payload: Partial<Evento>, editandoId: string | null): Evento | null {
    if (!editandoId) return null;

    const actual = this.eventos.find((evento) => evento.id === editandoId);
    if (!actual) return null;

    return {
      ...actual,
      ...payload,
      id: actual.id,
      organizer_id: actual.organizer_id,
      current_participants: actual.current_participants,
      created_at: actual.created_at,
      updated_at: new Date().toISOString()
    } as Evento;
  }

  private extraerError(respuesta: Evento | RespuestaEvento): string {
    if (!respuesta || typeof respuesta !== 'object') return '';
    return 'error' in respuesta ? String(respuesta.error ?? '') : '';
  }

  private crearHeaders(token = this.obtenerToken()): HttpHeaders {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private obtenerToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private normalizarEstado(estado: string | null | undefined): string {
    const valor = String(estado ?? 'programado').trim().toLowerCase();

    if (['active', 'activo', 'en_curso'].includes(valor)) return 'en_curso';
    if (['pending', 'pendiente', 'programado', 'scheduled'].includes(valor)) return 'programado';
    if (['finished', 'completed', 'complete', 'finalizado', 'completado'].includes(valor)) return 'finalizado';
    if (['cancelled', 'canceled', 'cancelado'].includes(valor)) return 'cancelado';
    if (['inactive', 'inactivo'].includes(valor)) return 'inactive';

    return valor || 'programado';
  }

  private estadoParaBackend(estado: string): string {
    return this.normalizarEstado(estado);
  }

  private formatearParaInput(fecha: string | null | undefined): string {
    if (!fecha) return '';
    return fecha.slice(0, 16);
  }

  private obtenerMensajeError(error: unknown, respaldo: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: string; message?: string } | string | null;
      if (typeof body === 'string') return body.trim() || respaldo;
      return body?.error ?? body?.message ?? respaldo;
    }

    return respaldo;
  }
}