// src/app/features/vecino/pages/perfil-vecino/perfil-vecino.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, timeout } from 'rxjs';

import { WebServices } from '../../../../core/services/webServices';
import { EncabezadoPerfil } from '../../../../compartido/componentes/encabezado-perfil/encabezado-perfil';
import { TarjetaEstadistica } from '../../../../compartido/componentes/tarjeta-estadistica/tarjeta-estadistica';
import { Perfil, RespuestaPerfil, Publicacion, Denuncia } from '../../../../compartido/modelos/perfil.model';
import { Event } from '../../../../core/services/event.service';

interface Cita {
  id: string;
  service_id: string;
  status: string;
  requested_date: string;
}

interface resena {
  id: string;
  service_id: string;
  author_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  service?: { name: string };
}

interface Favorito {
  id: number;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

interface Servicio {
  id: string;
  name: string;
  avg_rating: number;
  reviews_count: number;
  provider_id: string;
}

interface ReporteComunitario {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-perfil-vecino',
  standalone: true,
  imports: [CommonModule, FormsModule, EncabezadoPerfil, TarjetaEstadistica],
  templateUrl: './perfil-vecino.html',
  styleUrls: ['./perfil-vecino.css']
})
export class PerfilVecino implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  // Estado
  cargando = true;
  error = '';
  perfil: Perfil | null = null;

  // Estadísticas principales
  publicaciones = 0;
  denuncias = 0;
  favoritos = 0;
  eventos = 0;
  comentarios = 0;
  serviciosSolicitados = 0;

  // resenas y calificaciones
  resenasRecibidas = 0;
  calificacionPromedio = 0;
  resenasEscritas = 0;
  resenasRecientes: resena[] = [];

  // Servicios destacados
  serviciosDestacados: Servicio[] = [];

  // Denuncias comunitarias del usuario
  misReportes: ReporteComunitario[] = [];

  // Modal de edición
  modalEditarAbierto = false;
  guardandoPerfil = false;
  errorGuardado = '';
  formPerfil = {
    name: '',
    phone: '',
    address: '',
    avatar_url: ''
  };

  constructor(
    private readonly http: HttpClient,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // ============================================================
  // CARGA DEL PERFIL
  // ============================================================
  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    if (!isPlatformBrowser(this.platformId)) {
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('access_token');
    const perfilLocal = this.leerPerfilLocal();

    if (perfilLocal) {
      this.establecerPerfil(perfilLocal, !token);
    }

    if (!token) {
      if (!perfilLocal) {
        this.error = 'Iniciá sesión para ver tu perfil.';
        this.cargando = false;
        this.changeDetector.detectChanges();
      }
      return;
    }

    const headers = this.crearHeadersNgrok(token);

    this.http.get<Perfil | RespuestaPerfil>(WebServices.AuthMe, { headers }).pipe(
      timeout(8000),
      map((respuesta) => this.extraerPerfil(respuesta)),
      catchError(() => of(null))
    ).subscribe((perfil) => {
      if (!perfil) {
        if (!perfilLocal) {
          this.error = 'No se pudo cargar la información del perfil.';
          this.cargando = false;
          this.changeDetector.detectChanges();
        }
        return;
      }
      this.establecerPerfil(perfil, true);
    });
  }

  // ============================================================
  // MODAL DE EDICIÓN
  // ============================================================
  abrirModalEditar(): void {
    this.formPerfil = {
      name: this.perfil?.name ?? '',
      phone: this.perfil?.phone ?? '',
      address: this.perfil?.address ?? '',
      avatar_url: this.perfil?.avatar_url ?? ''
    };
    this.errorGuardado = '';
    this.modalEditarAbierto = true;
    this.changeDetector.detectChanges();
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
  }

  guardarPerfil(): void {
    if (!this.perfil?.id || this.guardandoPerfil) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorGuardado = 'Tu sesión expiró. Iniciá sesión nuevamente.';
      this.changeDetector.detectChanges();
      return;
    }

    if (!this.formPerfil.name.trim()) {
      this.errorGuardado = 'El nombre es obligatorio.';
      this.changeDetector.detectChanges();
      return;
    }

    const datosActualizados = {
      name: this.formPerfil.name.trim(),
      phone: this.formPerfil.phone.trim() || null,
      address: this.formPerfil.address.trim() || null,
      avatar_url: this.formPerfil.avatar_url.trim() || null
    };

    this.guardandoPerfil = true;
    this.errorGuardado = '';

    this.http.patch<Perfil | RespuestaPerfil>(
      WebServices.ProfileUpdate(this.perfil.id),
      datosActualizados,
      { headers: this.crearHeadersNgrok(token) }
    ).subscribe({
      next: (respuesta) => {
        const perfilActualizado = this.extraerPerfil(respuesta) ?? {
          ...this.perfil!,
          ...datosActualizados
        };
        this.perfil = perfilActualizado;
        localStorage.setItem('user', JSON.stringify(perfilActualizado));
        this.cargarActividad(perfilActualizado.id);
        this.modalEditarAbierto = false;
        this.guardandoPerfil = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.errorGuardado = 'No se pudo guardar el perfil en el servidor.';
        this.guardandoPerfil = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  // ============================================================
  // CARGA DE ACTIVIDAD COMPLETA
  // ============================================================
  private establecerPerfil(perfil: Perfil, cargarActividad = true): void {
    this.perfil = perfil;
    localStorage.setItem('user', JSON.stringify(perfil));
    this.cargando = false;
    this.error = '';
    this.changeDetector.detectChanges();

    if (cargarActividad) {
      this.cargarActividad(perfil.id);
    }
  }

  private cargarActividad(idPerfil: string): void {
    forkJoin({
      publicaciones: this.obtenerPublicaciones(idPerfil),
      denuncias: this.obtenerDenuncias(idPerfil),
      eventos: this.obtenerEventosInscritos(),
      citas: this.obtenerMisCitas(),
      favoritos: this.obtenerFavoritos(),
      resenasRecibidas: this.obtenerresenasRecibidas(idPerfil),
      resenasEscritas: this.obtenerresenasEscritas(idPerfil),
      servicios: this.obtenerServiciosDelUsuario(idPerfil),
      reportes: this.obtenerMisReportes(idPerfil)
    }).subscribe({
      next: ({
        publicaciones,
        denuncias,
        eventos,
        citas,
        favoritos,
        resenasRecibidas,
        resenasEscritas,
        servicios,
        reportes
      }) => {
        // Estadísticas básicas
        this.publicaciones = publicaciones;
        this.denuncias = denuncias;
        this.eventos = eventos.length;
        this.serviciosSolicitados = citas.length;
        this.favoritos = favoritos.length;

        // resenas
        this.resenasRecibidas = resenasRecibidas.length;
        if (resenasRecibidas.length > 0) {
          const total = resenasRecibidas.reduce((sum, r) => sum + r.rating, 0);
          this.calificacionPromedio = Number((total / resenasRecibidas.length).toFixed(1));
        } else {
          this.calificacionPromedio = 0;
        }
        this.resenasEscritas = resenasEscritas.length;
        this.resenasRecientes = resenasRecibidas
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        // Servicios destacados (top 3 con mejor calificación)
        this.serviciosDestacados = servicios
          .filter(s => s.avg_rating > 0)
          .sort((a, b) => b.avg_rating - a.avg_rating)
          .slice(0, 3);

        // Mis reportes comunitarios
        this.misReportes = reportes
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        this.comentarios = 0; // Si no tienes endpoint, queda en 0

        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar actividad:', err);
        this.error = 'No se pudo cargar toda la actividad.';
        this.cargando = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  // ============================================================
  // MÉTODOS DE OBTENCIÓN DE DATOS
  // ============================================================

  private obtenerPublicaciones(idPerfil: string) {
    return this.http.get<any[] | { data: any[] }>(
      this.conCacheBust(WebServices.PostsList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        return lista.filter(p => String(p.author_id) === String(idPerfil)).length;
      }),
      catchError(() => of(0))
    );
  }

  private obtenerDenuncias(idPerfil: string) {
    return this.http.get<any[] | { data: any[] }>(
      this.conCacheBust(WebServices.ReportsList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        return lista.filter(d => String(d.author_id) === String(idPerfil)).length;
      }),
      catchError(() => of(0))
    );
  }

  private obtenerEventosInscritos() {
    return this.http.get<Event[] | { data: Event[] }>(
      this.conCacheBust(WebServices.EventsMine),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => Array.isArray(resp) ? resp : resp.data ?? []),
      catchError(() => of([] as Event[]))
    );
  }

  private obtenerMisCitas() {
    return this.http.get<Cita[] | { data: Cita[] }>(
      this.conCacheBust(WebServices.AppointmentsMe),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => Array.isArray(resp) ? resp : resp.data ?? []),
      catchError(() => of([] as Cita[]))
    );
  }

  private obtenerFavoritos() {
    return this.http.get<Favorito[] | { data: Favorito[] }>(
      this.conCacheBust(WebServices.FavoritesList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => Array.isArray(resp) ? resp : resp.data ?? []),
      catchError(() => of([] as Favorito[]))
    );
  }

  private obtenerresenasRecibidas(idPerfil: string) {
    return this.http.get<resena[] | { data: resena[] }>(
      this.conCacheBust(WebServices.ReviewsList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        // Filtrar resenas donde el usuario es el autor de la resena (no las que él escribió)
        return lista.filter(r => r.author_id !== idPerfil);
      }),
      catchError(() => of([] as resena[]))
    );
  }

  private obtenerresenasEscritas(idPerfil: string) {
    return this.http.get<resena[] | { data: resena[] }>(
      this.conCacheBust(WebServices.ReviewsList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        return lista.filter(r => r.author_id === idPerfil);
      }),
      catchError(() => of([] as resena[]))
    );
  }

  private obtenerServiciosDelUsuario(idPerfil: string) {
    return this.http.get<any[] | { data: any[] }>(
      this.conCacheBust(WebServices.ServicesList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        return lista.filter(s => s.provider_id === idPerfil);
      }),
      catchError(() => of([] as Servicio[]))
    );
  }

  private obtenerMisReportes(idPerfil: string) {
    return this.http.get<any[] | { data: any[] }>(
      this.conCacheBust(WebServices.ReportsList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((resp) => {
        const lista = Array.isArray(resp) ? resp : resp.data ?? [];
        return lista.filter(r => String(r.author_id) === String(idPerfil));
      }),
      catchError(() => of([] as ReporteComunitario[]))
    );
  }

  // ============================================================
  // NAVEGACIÓN
  // ============================================================
  irPublicaciones(): void {
    this.router.navigate(['/mis-publicaciones']);
  }

  irDenuncias(): void {
    this.router.navigate(['/denuncia/nueva']);
  }

  irFavoritos(): void {
    this.router.navigate(['/mis-favoritos']);
  }

  irEventos(): void {
    this.router.navigate(['/eventos']);
  }

  irNotificaciones(): void {
    this.router.navigate(['/mis-notificaciones']);
  }

  irMisCitas(): void {
    this.router.navigate(['/mis-citas']);
  }

  irServicios(): void {
    this.router.navigate(['/servicios']);
  }

  irMisReportes(): void {
    this.router.navigate(['/denuncias/comunitarias']);
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  private leerPerfilLocal(): Perfil | null {
    const usuarioGuardado = localStorage.getItem('user');
    if (!usuarioGuardado) return null;
    try {
      return this.normalizarPerfil(JSON.parse(usuarioGuardado));
    } catch {
      return null;
    }
  }

  private extraerPerfil(respuesta: unknown): Perfil | null {
    if (!respuesta || typeof respuesta !== 'object') return null;
    const contenedor = respuesta as RespuestaPerfil;
    return this.normalizarPerfil(
      contenedor.user ?? contenedor.profile ?? contenedor.data ?? respuesta
    );
  }

  private crearHeadersNgrok(token?: string | null): HttpHeaders {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  private conCacheBust(url: string): string {
    const separador = url.includes('?') ? '&' : '?';
    return `${url}${separador}_t=${Date.now()}`;
  }

  private normalizarPerfil(valor: unknown): Perfil | null {
    if (!valor || typeof valor !== 'object') return null;
    const perfil = valor as Partial<Perfil>;
    if (typeof perfil.id !== 'string') return null;

    return {
      ...perfil,
      id: perfil.id,
      name: perfil.name ?? 'Usuario',
      email: perfil.email ?? '',
      role: perfil.role || 'vecino',
      avatar_url: perfil.avatar_url ?? null,
      phone: perfil.phone ?? null,
      address: perfil.address ?? null,
      is_active: perfil.is_active ?? true,
      id_verified: perfil.id_verified ?? false
    };
  }

  recargarPerfil(): void {
    this.cargarPerfil();
  }
}
