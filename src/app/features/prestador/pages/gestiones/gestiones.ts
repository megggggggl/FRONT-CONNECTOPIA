import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, map, of, timeout } from 'rxjs';

import { WebServices } from '../../../../core/services/webServices';
import { Perfil, Resena, RespuestaLista, RespuestaPerfil, ServicioResumen } from '../../../../compartido/modelos/perfil.model';
import { AccionHistorialCita, SolicitudCita } from '../../../../compartido/modelos/appointment.model';
import { TelegramCitasService } from '../../../../compartido/servicios/appointment.service';

// ============================================================
// INTERFAZ LOCAL PARA EL FORMULARIO DE SERVICIO
// ============================================================
interface ServicioForm {
  id?: string | null;
  name: string;
  description: string;
  price: string;
  address: string;
  phone: string;
  image: string;
}

@Component({
  selector: 'app-gestiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
    
  
  ],
  templateUrl: './gestiones.html',
  styleUrls: ['./gestiones.css']
})
export class Gestiones implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ultimoRefreshTelegram = 0;
  private telegramTokenTimeoutId: number | null = null;
  private refrescoAutomaticoId: number | null = null;
  private readonly intervaloRefrescoAutomaticoMs = 4000;

  cargando = true;
  error = '';

  perfil: Perfil | null = null;
  servicios: ServicioResumen[] = [];
  resenas: Resena[] = [];
  citasRecibidas = signal<SolicitudCita[]>([]);
  citasRecibidasCargando = signal(false);
  citasRecibidasError = signal('');
  citaHistorialId = signal<string | null>(null);
  citaHistorialError = signal('');
  citaHistorialExito = signal('');

  telegramCargando = false;
  telegramError = '';
  telegramExito = '';
  telegramUrl = '';
  telegramDeepLink = '';
  telegramComando = '';
  telegramPayload = '';
  telegramExpiraEn: number | null = null;
  telegramGeneradoEn = 0;
  citaServicioId: string | null = null;
  citaError = '';
  modalServicioAbierto = false;
  servicioGuardando = false;
  eliminandoServicioId: string | null = null;
  servicioError = '';
  servicioExito = '';
  formServicio: ServicioForm = this.crearFormularioServicio();
  esEdicion = false;

  get totalServicios(): number {
    return this.servicios.length;
  }

  get serviciosActivos(): number {
    return this.contarServiciosPorEstado('active');
  }

  get serviciosPendientes(): number {
    return this.contarServiciosPorEstado('pending');
  }

  get serviciosInactivos(): number {
    return this.contarServiciosPorEstado('inactive');
  }

  get calificacionPromedio(): number {
    const totalResenas = this.totalResenas;
    if (totalResenas === 0) return 0;

    const totalPonderado = this.servicios.reduce((total, servicio) => {
      const rating = Number(servicio.avg_rating) || 0;
      const reviews = Number(servicio.reviews_count) || 0;
      return total + rating * reviews;
    }, 0);

    return Number((totalPonderado / totalResenas).toFixed(1));
  }

  get totalResenas(): number {
    return this.servicios.reduce(
      (total, servicio) => total + Number(servicio.reviews_count ?? 0),
      0
    );
  }

  get citasRecibidasPendientes(): number {
    return this.contarCitasRecibidasPorEstado('pending');
  }

  get citasRecibidasAceptadas(): number {
    return this.contarCitasRecibidasPorEstado('accepted');
  }

  get citasRecibidasRechazadas(): number {
    return this.contarCitasRecibidasPorEstado('rejected');
  }

  get telegramVinculado(): boolean {
    return Boolean(this.perfil?.telegram_chat_id);
  }

  get telegramEnlaceGenerado(): boolean {
    return Boolean(this.telegramPayload && this.telegramComando);
  }

  get telegramTokenVencido(): boolean {
    if (!this.telegramEnlaceGenerado || !this.telegramExpiraEn || !this.telegramGeneradoEn) {
      return false;
    }
    return Date.now() >= this.telegramGeneradoEn + this.telegramExpiraEn * 60 * 1000;
  }

  get servicioMejorCalificado(): string {
    const serviciosCalificados = this.servicios.filter(
      (servicio) => Number(servicio.reviews_count ?? 0) > 0
    );
    if (serviciosCalificados.length === 0) return 'Sin datos';
    return serviciosCalificados.reduce((mejor, actual) => {
      return Number(actual.avg_rating ?? 0) > Number(mejor.avg_rating ?? 0)
        ? actual
        : mejor;
    }).name;
  }

  constructor(
    private readonly http: HttpClient,
    private readonly telegramCitas: TelegramCitasService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
    this.iniciarRefrescoAutomatico();
  }

  ngOnDestroy(): void {
    this.detenerRefrescoAutomatico();
    if (this.telegramTokenTimeoutId !== null && isPlatformBrowser(this.platformId)) {
      window.clearTimeout(this.telegramTokenTimeoutId);
    }
  }

  @HostListener('window:focus')
  alRecuperarFoco(): void {
    this.refrescarDatosTelegram();
  }

  @HostListener('document:visibilitychange')
  alCambiarVisibilidad(): void {
    if (document.visibilityState === 'visible') {
      this.refrescarDatosTelegram();
    }
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    if (!isPlatformBrowser(this.platformId)) {
      this.cargando = false;
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'Iniciá sesión para ver el dashboard.';
      this.cargando = false;
      this.changeDetector.detectChanges();
      return;
    }

    const headers = this.crearHeadersNgrok(token);

    this.http.get<Perfil | RespuestaPerfil>(WebServices.AuthMe, { headers }).pipe(
      timeout(8000),
      map((respuesta) => this.extraerPerfil(respuesta)),
      catchError((err) => {
        console.error('❌ Error al obtener perfil:', err);
        return of(null);
      })
    ).subscribe((perfil) => {
      if (!perfil) {
        this.error = 'No se pudo cargar la información del perfil.';
        this.cargando = false;
        this.changeDetector.detectChanges();
        return;
      }
      this.establecerPerfil(perfil, true);
    });
  }

  private establecerPerfil(perfil: Perfil, cargarServicios = true): void {
    this.perfil = perfil;
    localStorage.setItem('user', JSON.stringify(perfil));
    this.cargando = false;
    this.error = '';
    this.changeDetector.detectChanges();

    if (cargarServicios) {
      this.cargarServicios(perfil.id);
      this.cargarCitasRecibidas(true);
    }
  }

  private refrescarDatosTelegram(): void {
    if (!isPlatformBrowser(this.platformId) || !this.perfil?.id) return;
    if (!localStorage.getItem('access_token')) return;

    const ahora = Date.now();
    if (ahora - this.ultimoRefreshTelegram < 1200) return;
    this.ultimoRefreshTelegram = ahora;

    this.refrescarPerfilDesdeBackend(false);
    this.cargarCitasRecibidas(false);
    this.cargarServicios(this.perfil.id);
  }

  private iniciarRefrescoAutomatico(): void {
    if (!isPlatformBrowser(this.platformId) || this.refrescoAutomaticoId !== null) return;
    this.refrescoAutomaticoId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      this.refrescarDatosTelegram();
    }, this.intervaloRefrescoAutomaticoMs);
  }

  private detenerRefrescoAutomatico(): void {
    if (!isPlatformBrowser(this.platformId) || this.refrescoAutomaticoId === null) return;
    window.clearInterval(this.refrescoAutomaticoId);
    this.refrescoAutomaticoId = null;
  }

  private refrescarPerfilDesdeBackend(mostrarCarga = true): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (mostrarCarga) {
      this.telegramCargando = true;
    }

    this.http.get<Perfil | RespuestaPerfil>(
      WebServices.AuthMe,
      { headers: this.crearHeadersNgrok(token) }
    ).pipe(
      timeout(8000),
      map((respuesta) => this.extraerPerfil(respuesta)),
      catchError(() => of(null)),
      finalize(() => {
        if (mostrarCarga) {
          this.telegramCargando = false;
        }
        this.changeDetector.detectChanges();
      })
    ).subscribe((perfil) => {
      if (!perfil) return;
      this.perfil = perfil;
      localStorage.setItem('user', JSON.stringify(perfil));
    });
  }

  private cargarServicios(idPrestador: string): void {
    this.http.get<ServicioResumen[] | RespuestaLista<ServicioResumen>>(
      this.conCacheBust(WebServices.ServicesList),
      { headers: this.crearHeadersNgrok() }
    ).pipe(
      timeout(8000),
      map((respuesta) => Array.isArray(respuesta) ? respuesta : respuesta.data ?? []),
      catchError(() => of([] as ServicioResumen[]))
    ).subscribe({
      next: (servicios) => {
        this.servicios = servicios.filter(
          (servicio) => String(servicio.provider_id) === String(idPrestador)
        );
        this.resenas = [];
        this.cargando = false;
        this.changeDetector.detectChanges();
        this.cargarResenasServicios(this.servicios);
      },
      error: (error) => {
        console.error('Error al cargar servicios del prestador:', error);
        this.error = 'No se pudo cargar la actividad.';
        this.cargando = false;
      }
    });
  }

  private cargarResenasServicios(servicios: ServicioResumen[]): void {
    if (servicios.length === 0) return;

    const solicitudes = servicios.map((servicio) =>
      this.http.get<Resena[] | RespuestaLista<Resena>>(
        this.conCacheBust(WebServices.ServiceReviewsList(servicio.id)),
        { headers: this.crearHeadersNgrok() }
      ).pipe(
        timeout(8000),
        map((respuesta) => {
          const resenas = Array.isArray(respuesta) ? respuesta : respuesta.data ?? [];
          return resenas.map((resena) => ({
            ...resena,
            servicio_nombre: servicio.name
          }));
        }),
        catchError(() => of([] as Resena[]))
      )
    );

    forkJoin(solicitudes).subscribe((resenasPorServicio) => {
      this.resenas = resenasPorServicio.reduce<Resena[]>(
        (todas, resenas) => todas.concat(resenas),
        []
      );
      this.changeDetector.detectChanges();
    });
  }

  private cargarCitasRecibidas(mostrarCarga = true): void {
    if (mostrarCarga) {
      this.citasRecibidasCargando.set(true);
    }
    this.citasRecibidasError.set('');

    this.telegramCitas.obtenerCitasPrestador().pipe(
      timeout(8000),
      catchError((error) => {
        console.error('Error al cargar citas recibidas:', error);
        this.citasRecibidasError.set('No se pudieron cargar las solicitudes recibidas.');
        return of([] as SolicitudCita[]);
      }),
      finalize(() => {
        if (mostrarCarga) {
          this.citasRecibidasCargando.set(false);
        }
        this.changeDetector.detectChanges();
      })
    ).subscribe((citas) => {
      this.citasRecibidas.set(citas);
      if (mostrarCarga) {
        this.citasRecibidasCargando.set(false);
      }
    });
  }

  private actualizarHistorialCita(cita: SolicitudCita, action: AccionHistorialCita): void {
    if (!cita.id || !this.puedeAdministrarHistorial(cita)) return;

    this.citaHistorialId.set(cita.id);
    this.citaHistorialError.set('');
    this.citaHistorialExito.set('');

    this.telegramCitas.actualizarHistorialCita(cita.id, action).pipe(
      timeout(8000),
      finalize(() => {
        this.citaHistorialId.set(null);
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.citasRecibidas.set(this.citasRecibidas().filter((item) => item.id !== cita.id));
        const mensaje: Record<AccionHistorialCita, string> = {
          hide: 'Cita ocultada del historial.',
          archive: 'Cita archivada.',
          delete: 'Cita eliminada.'
        };
        this.citaHistorialExito.set(mensaje[action]);
      },
      error: (error) => {
        this.citaHistorialError.set(
          this.extraerMensajeError(error, 'No se pudo actualizar el historial de la cita.')
        );
      }
    });
  }

  private contarServiciosPorEstado(estado: string): number {
    return this.servicios.filter(
      (servicio) => String(servicio.status ?? '').toLowerCase() === estado
    ).length;
  }

  private contarCitasRecibidasPorEstado(estado: string): number {
    return this.citasRecibidas().filter(
      (cita) => String(cita.status ?? '').toLowerCase() === estado
    ).length;
  }

  private crearFormularioServicio(servicio?: ServicioResumen): ServicioForm {
    return {
      id: servicio?.id || null,
      name: servicio?.name || '',
      description: servicio?.description || '',
      price: servicio?.price || '',
      address: servicio?.address || '',
      phone: servicio?.phone || '',
      image: (servicio?.images && servicio.images.length > 0) ? servicio.images[0] : ''
    };
  }

  private obtenerIdentificadorCorto(id: string | null | undefined, prefijo: string): string {
    if (!id) return prefijo;
    return `${prefijo} #${String(id).slice(0, 8)}`;
  }

  private limpiarEnlaceTelegram(): void {
    if (this.telegramTokenTimeoutId !== null && isPlatformBrowser(this.platformId)) {
      window.clearTimeout(this.telegramTokenTimeoutId);
    }
    this.telegramTokenTimeoutId = null;
    this.telegramUrl = '';
    this.telegramDeepLink = '';
    this.telegramComando = '';
    this.telegramPayload = '';
    this.telegramExpiraEn = null;
    this.telegramGeneradoEn = 0;
  }

  private programarLimpiezaTelegram(): void {
    if (!isPlatformBrowser(this.platformId) || !this.telegramExpiraEn || !this.telegramGeneradoEn) return;

    if (this.telegramTokenTimeoutId !== null) {
      window.clearTimeout(this.telegramTokenTimeoutId);
    }

    const tiempoRestante = this.telegramGeneradoEn + this.telegramExpiraEn * 60 * 1000 - Date.now();
    this.telegramTokenTimeoutId = window.setTimeout(() => {
      this.limpiarEnlaceTelegram();
      this.changeDetector.detectChanges();
    }, Math.max(tiempoRestante, 0));
  }

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

  private obtenerToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('access_token');
  }

  private extraerMensajeError(error: unknown, mensajeDefault: string): string {
    if (!error || typeof error !== 'object') return mensajeDefault;
    const respuesta = error as {
      error?: {
        error?: string;
        message?: string;
      };
      message?: string;
      status?: number;
    };
    return respuesta.error?.error
      ?? respuesta.error?.message
      ?? respuesta.message
      ?? mensajeDefault;
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
      role: perfil.role || 'prestador',
      avatar_url: perfil.avatar_url ?? null,
      phone: perfil.phone ?? null,
      address: perfil.address ?? null,
      is_active: perfil.is_active ?? true,
      id_verified: perfil.id_verified ?? false,
      telegram_chat_id: perfil.telegram_chat_id ?? null
    };
  }

  // ============================================================
  // MÉTODOS PÚBLICOS PARA EL TEMPLATE
  // ============================================================

  // ----- TELEGRAM -----
  actualizarEstadoTelegram(): void {
    this.refrescarPerfilDesdeBackend(true);
  }

  vincularTelegram(): void {
    if (this.telegramCargando) return;

    if (this.telegramEnlaceGenerado && !this.telegramTokenVencido) {
      this.telegramCitas.abrirTelegram(this.telegramDeepLink);
      return;
    }

    this.telegramCargando = true;
    this.telegramError = '';
    this.telegramExito = '';
    this.limpiarEnlaceTelegram();

    this.telegramCitas.crearEnlaceVinculacion().pipe(
      timeout(8000),
      finalize(() => {
        this.telegramCargando = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (respuesta) => {
        const urlBackend = this.telegramCitas.extraerUrlTelegram(respuesta);
        const payload = this.telegramCitas.extraerPayloadInicio(respuesta);
        const comando = this.telegramCitas.extraerComandoInicio(respuesta)
          || this.telegramCitas.crearComandoInicioDesdePayload(payload);

        if (!payload || !comando) {
          this.telegramError = 'El backend no devolvio el codigo seguro de Telegram.';
          return;
        }

        this.telegramPayload = payload;
        this.telegramComando = comando;
        this.telegramDeepLink = this.telegramCitas.crearComandoInicioDesdePayload(payload);
        this.telegramUrl = this.telegramCitas.crearLinkTelegramWeb(payload);
        this.telegramExpiraEn = respuesta.expires_in_minutes
          ?? respuesta.data?.expires_in_minutes
          ?? null;
        this.telegramGeneradoEn = Date.now();

        this.telegramCitas.abrirTelegram(this.telegramDeepLink);
        this.programarLimpiezaTelegram();
        this.telegramExito = 'Enlace generado. Intentamos abrir Telegram Desktop. Si no se abre automaticamente, copia el comando y envialo a @ConnectopiaHNBot.';
      },
      error: (error) => {
        this.telegramError = this.extraerMensajeError(
          error,
          'No se pudo generar el enlace de Telegram.'
        );
      }
    });
  }

  abrirTelegramDesktop(): void {
    if (!this.telegramDeepLink || this.telegramTokenVencido) {
      this.telegramError = this.telegramTokenVencido
        ? 'Token vencido. Genera un enlace nuevo.'
        : 'Genera un enlace de Telegram antes de abrir Desktop.';
      return;
    }
    this.telegramCitas.abrirTelegram(this.telegramDeepLink);
    this.telegramExito = 'Intentamos abrir Telegram Desktop. Si no aparece, usa Telegram Web o copia el comando.';
    this.telegramError = '';
  }

  abrirTelegramWeb(): void {
    if (!this.telegramUrl || this.telegramTokenVencido) {
      this.telegramError = this.telegramTokenVencido
        ? 'Token vencido. Genera un enlace nuevo.'
        : 'Genera un enlace de Telegram antes de abrir Telegram Web.';
      return;
    }
    const abierto = this.telegramCitas.abrirTelegramWeb(this.telegramUrl);
    this.telegramExito = abierto
      ? 'Abrimos Telegram Web en una pestana nueva. Si Firefox no carga t.me, copia el comando manual.'
      : 'No se pudo abrir una pestana nueva. Copia el comando y envialo a @ConnectopiaHNBot.';
    this.telegramError = '';
  }

  copiarComandoTelegram(): void {
    if (!this.telegramComando || !isPlatformBrowser(this.platformId)) return;
    if (this.telegramTokenVencido) {
      this.telegramError = 'Token vencido. Genera un enlace nuevo.';
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(this.telegramComando).then(() => {
        this.telegramExito = 'Comando copiado. Pegalo en el chat de @ConnectopiaHNBot.';
        this.changeDetector.detectChanges();
      }).catch(() => {
        this.telegramError = 'No se pudo copiar automaticamente. Selecciona el comando y copialo manualmente.';
        this.changeDetector.detectChanges();
      });
      return;
    }
    this.telegramError = 'Selecciona el comando y copialo manualmente.';
  }

  // ----- CITAS -----
  actualizarCitasRecibidas(): void {
    this.cargarCitasRecibidas(true);
  }

  obtenerEtiquetaCita(estado: string | null | undefined): string {
    return this.telegramCitas.obtenerEtiquetaEstado(estado);
  }

  obtenerClaseEstadoCita(estado: string | null | undefined): string {
    return this.telegramCitas.obtenerClaseEstado(estado);
  }

  obtenerCodigoCita(cita: SolicitudCita): string {
    return this.telegramCitas.obtenerCodigoSolicitud(cita);
  }

  obtenerNombreServicioCita(cita: SolicitudCita): string {
    return cita.service?.name ?? cita.service?.title ?? 'Servicio solicitado';
  }

  obtenerNombreVecinoCita(cita: SolicitudCita): string {
    return cita.neighbor?.name ?? cita.neighbor?.email ?? this.obtenerIdentificadorCorto(cita.neighbor_id, 'Vecino');
  }

  obtenerFechaHoraCita(cita: SolicitudCita): string {
    return this.telegramCitas.obtenerFechaHoraSolicitud(cita);
  }

  obtenerDireccionCita(cita: SolicitudCita): string {
    return this.telegramCitas.obtenerDireccionSolicitud(cita);
  }

  obtenerDescripcionCita(cita: SolicitudCita): string {
    return this.telegramCitas.obtenerDescripcionSolicitud(cita);
  }

  puedeAdministrarHistorial(cita: SolicitudCita): boolean {
    return ['delivery_failed', 'cancelled', 'expired', 'rejected'].includes(
      String(cita.status ?? '').toLowerCase()
    );
  }

  ocultarCitaRecibida(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'hide');
  }

  archivarCitaRecibida(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'archive');
  }

  eliminarCitaRecibida(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'delete');
  }

  puedeSolicitarCita(servicio: ServicioResumen): boolean {
    const estado = String(servicio.status ?? '').toLowerCase();
    const servicioActivo = ['active', 'activo', 'en_curso'].includes(estado);
    const tieneDatos = Boolean(servicio.id && servicio.provider_id);
    const esMismoPrestador = String(servicio.provider_id) === String(this.perfil?.id ?? '');
    return tieneDatos && servicioActivo && !esMismoPrestador;
  }

  solicitarCitaTelegram(servicio: ServicioResumen): void {
    if (!this.puedeSolicitarCita(servicio)) return;
    if (this.citaServicioId) return;

    this.citaServicioId = servicio.id;
    this.citaError = '';

    this.telegramCitas.solicitarCita(servicio.id).pipe(
      timeout(8000),
      finalize(() => {
        this.citaServicioId = null;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (respuesta) => {
        const url = this.telegramCitas.extraerUrlTelegram(respuesta);
        if (!url) {
          this.citaError = 'El backend no devolvio el enlace para la cita.';
          return;
        }
        this.telegramCitas.abrirTelegram(url);
      },
      error: (error) => {
        this.citaError = this.extraerMensajeError(
          error,
          'No se pudo iniciar la solicitud por Telegram.'
        );
      }
    });
  }

  // ----- SERVICIOS CRUD -----
  abrirModalCrearServicio(): void {
    this.formServicio = this.crearFormularioServicio();
    this.esEdicion = false;
    this.servicioError = '';
    this.servicioExito = '';
    this.modalServicioAbierto = true;
  }

  abrirModalEditarServicio(servicio: ServicioResumen): void {
    this.formServicio = this.crearFormularioServicio(servicio);
    this.esEdicion = true;
    this.servicioError = '';
    this.servicioExito = '';
    this.modalServicioAbierto = true;
  }

  cerrarModalServicio(): void {
    if (this.servicioGuardando) return;
    this.modalServicioAbierto = false;
  }

  guardarServicio(): void {
    if (!this.perfil?.id || this.servicioGuardando) return;

    const nombre = this.formServicio.name.trim();
    const descripcion = this.formServicio.description.trim();

    if (!nombre || !descripcion) {
      this.servicioError = 'Nombre y descripcion son obligatorios.';
      return;
    }

    const payload = {
      name: nombre,
      description: descripcion,
      category_id: null,
      price: this.formServicio.price.trim() || null,
      location: null,
      address: this.formServicio.address.trim() || null,
      phone: this.formServicio.phone.trim() || this.perfil.phone || null,
      email: this.perfil.email || null,
      images: this.formServicio.image.trim() ? [this.formServicio.image.trim()] : [],
      schedule: {}
    };

    this.servicioGuardando = true;
    this.servicioError = '';
    this.servicioExito = '';

    const url = this.esEdicion ? WebServices.ServiceUpdate(this.formServicio.id!) : WebServices.ServicesCreate;
    const method = this.esEdicion ? this.http.patch<ServicioResumen>(url, payload, { headers: this.crearHeadersNgrok(this.obtenerToken()) }) :
                                   this.http.post<ServicioResumen>(url, payload, { headers: this.crearHeadersNgrok(this.obtenerToken()) });

    method.pipe(
      timeout(8000),
      finalize(() => {
        this.servicioGuardando = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (servicio) => {
        if (this.esEdicion) {
          // Actualizar en la lista
          const index = this.servicios.findIndex(s => s.id === servicio.id);
          if (index !== -1) {
            this.servicios[index] = servicio;
          }
        } else {
          // Agregar al inicio
          this.servicios = [servicio, ...this.servicios];
        }
        this.modalServicioAbierto = false;
        this.formServicio = this.crearFormularioServicio();
        this.servicioExito = this.esEdicion ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.';
        this.esEdicion = false;
      },
      error: (error) => {
        this.servicioError = this.extraerMensajeError(error, 'No se pudo guardar el servicio.');
      }
    });
  }

  eliminarServicio(servicio: ServicioResumen): void {
    if (!servicio?.id || this.eliminandoServicioId) return;

    if (isPlatformBrowser(this.platformId)) {
      const confirmar = window.confirm(`Eliminar el servicio "${servicio.name}"?`);
      if (!confirmar) return;
    }

    this.eliminandoServicioId = servicio.id;
    this.servicioError = '';
    this.servicioExito = '';

    this.http.delete<void>(
      WebServices.ServiceDelete(servicio.id),
      { headers: this.crearHeadersNgrok(this.obtenerToken()) }
    ).pipe(
      timeout(8000),
      finalize(() => {
        this.eliminandoServicioId = null;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.servicios = this.servicios.filter((item) => item.id !== servicio.id);
        this.servicioExito = 'Servicio eliminado.';
      },
      error: (error) => {
        this.servicioError = this.extraerMensajeError(error, 'No se pudo eliminar el servicio.');
      }
    });
  }
}
