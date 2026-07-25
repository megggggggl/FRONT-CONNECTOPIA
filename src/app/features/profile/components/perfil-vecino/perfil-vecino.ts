import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, map, of, timeout } from 'rxjs';

import { WebServices } from '../../../../core';
import { EncabezadoPerfil } from '../../../../compartido/componentes/encabezado-perfil/encabezado-perfil';
import { TarjetaEstadistica } from '../../../../compartido/componentes/tarjeta-estadistica/tarjeta-estadistica';
import { TarjetaServicio } from '../../../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';
import { Perfil, Resena, RespuestaLista, RespuestaPerfil, ServicioResumen } from '../../../../compartido/modelos/perfil.model';
import { ServicioDisponibleCita, SolicitudCita, AccionHistorialCita } from '../../../../compartido/modelos/appointment.model';
import { TelegramCitasService } from '../../../../compartido/servicios/appointment.service';

@Component({
  selector: 'app-perfil-vecino',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EncabezadoPerfil,
    TarjetaEstadistica,
    TarjetaServicio // Aunque no se use en el template, se mantiene por si acaso
  ],
  templateUrl: './perfil-vecino.html',
  styleUrl: './perfil-vecino.css'
})
export class PerfilVecino implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private ultimoRefreshTelegram = 0;
  private telegramTokenTimeoutId: number | null = null;
  private refrescoAutomaticoId: number | null = null;
  private readonly intervaloRefrescoAutomaticoMs = 4000;

  // ============================================================
  // ESTADO GENERAL
  // ============================================================
  cargando = true;
  error = '';
  perfil: Perfil | null = null;

  // ============================================================
  // DATOS DEL VECINO (simulados o reales)
  // ============================================================
  publicaciones = 0;
  denuncias = 0;
  favoritos = 0;
  eventos = 0;
  comentarios = 0;
  lugaresMasVisitados: any[] = [];

  // ============================================================
  // SERVICIOS DISPONIBLES (para solicitar citas)
  // ============================================================
  serviciosDisponibles = signal<ServicioDisponibleCita[]>([]);
  serviciosDisponiblesCargando = signal(false);
  serviciosDisponiblesError = signal('');

  // ============================================================
  // CITAS SOLICITADAS POR EL VECINO
  // ============================================================
  citas = signal<SolicitudCita[]>([]);
  citasCargando = signal(false);
  citasError = signal('');
  citaHistorialId = signal<string | null>(null);
  citaHistorialError = signal('');
  citaHistorialExito = signal('');

  // ============================================================
  // SOLICITUD DE CITA (flujo para una nueva cita)
  // ============================================================
  solicitudCitaServicioId = signal<string | null>(null);
  solicitudCitaError = signal('');
  solicitudCitaExito = signal('');
  solicitudCitaEnlaceGenerado = false;
  solicitudCitaTokenVencido = false;
  solicitudCitaTelegramServicioNombre = signal('');
  solicitudCitaTelegramExpiraEn = signal<number | null>(null);
  solicitudCitaTelegramComando = signal('');
  solicitudCitaUrl = '';
  solicitudCitaDeepLink = '';

  // ============================================================
  // MODALES
  // ============================================================
  modalEditarAbierto = false;
  formPerfil = {
    name: '',
    phone: '',
    address: '',
    avatar_url: ''
  };

  // ============================================================
  // CONSTRUCTOR
  // ============================================================
  constructor(
    private readonly http: HttpClient,
    private readonly telegramCitas: TelegramCitasService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
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

  // ============================================================
  // PERFIL
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
        this.error = 'Iniciá sesión para ver el perfil.';
        this.cargando = false;
        this.changeDetector.detectChanges();
        return;
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

  private establecerPerfil(perfil: Perfil, cargarDatos = true): void {
    this.perfil = perfil;
    localStorage.setItem('user', JSON.stringify(perfil));
    this.cargando = false;
    this.error = '';
    this.changeDetector.detectChanges();

    if (cargarDatos) {
      this.cargarServiciosDisponibles();
      this.cargarCitas();
    }
  }

  abrirModalEditar(): void {
    this.formPerfil = {
      name: this.perfil?.name ?? '',
      phone: this.perfil?.phone ?? '',
      address: this.perfil?.address ?? '',
      avatar_url: this.perfil?.avatar_url ?? ''
    };
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
  }

  guardarPerfil(): void {
    if (!this.perfil?.id) return;

    const datosActualizados = {
      name: this.formPerfil.name,
      phone: this.formPerfil.phone,
      address: this.formPerfil.address,
      avatar_url: this.formPerfil.avatar_url
    };

    this.http.patch<Perfil | RespuestaPerfil>(
      WebServices.ProfileUpdate(this.perfil.id),
      datosActualizados
    ).subscribe({
      next: (respuesta: any) => {
        const perfilActualizado = this.extraerPerfil(respuesta);
        if (!perfilActualizado) {
          this.error = 'El servidor devolvió un perfil inválido.';
          return;
        }
        this.perfil = perfilActualizado;
        localStorage.setItem('user', JSON.stringify(perfilActualizado));
        this.modalEditarAbierto = false;
      },
      error: (error: unknown) => {
        console.error('Error al actualizar perfil:', error);
        this.error = 'No se pudo actualizar el perfil.';
      }
    });
  }

  // ============================================================
  // GETTERS DE ESTADÍSTICAS (para el template)
  // ============================================================
  get citasPendientes(): number {
    return this.citas().filter(c => c.status === 'pending').length;
  }

  get citasConfirmadas(): number {
    return this.citas().filter(c => c.status === 'accepted').length;
  }

  get citasRechazadas(): number {
    return this.citas().filter(c => c.status === 'rejected' || c.status === 'cancelled').length;
  }

  // ============================================================
  // SERVICIOS DISPONIBLES
  // ============================================================
  cargarServiciosDisponibles(): void {
    this.serviciosDisponiblesCargando.set(true);
    this.serviciosDisponiblesError.set('');

    this.telegramCitas.obtenerServiciosDisponibles().pipe(
      timeout(8000),
      catchError((error: unknown) => {
        console.error('Error al cargar servicios disponibles:', error);
        this.serviciosDisponiblesError.set('No se pudieron cargar los servicios disponibles.');
        return of([] as ServicioDisponibleCita[]);
      }),
      finalize(() => {
        this.serviciosDisponiblesCargando.set(false);
        this.changeDetector.detectChanges();
      })
    ).subscribe((servicios) => {
      this.serviciosDisponibles.set(servicios);
    });
  }

  actualizarServiciosDisponibles(): void {
    this.cargarServiciosDisponibles();
  }

  obtenerNombreServicioDisponible(servicio: ServicioDisponibleCita): string {
    return servicio.service_name ?? servicio.name ?? 'Servicio sin nombre';
  }

  obtenerDescripcionServicioDisponible(servicio: ServicioDisponibleCita): string {
    return servicio.service_description ?? servicio.description ?? 'Sin descripción';
  }

  obtenerEstadoServicio(servicio: ServicioDisponibleCita): string {
    return servicio.service_status ?? servicio.status ?? 'Desconocido';
  }

  obtenerNombrePrestador(servicio: ServicioDisponibleCita): string {
    return servicio.provider_name ?? 'Prestador';
  }

  // ============================================================
  // SOLICITAR CITA POR TELEGRAM
  // ============================================================
  solicitarCitaPorTelegram(servicio: ServicioDisponibleCita): void {
    if (!servicio) return;
    const serviceId = servicio.service_id ?? servicio.id;
    if (!serviceId) {
      this.solicitudCitaError.set('El servicio no tiene un identificador válido.');
      return;
    }

    this.solicitudCitaServicioId.set(serviceId);
    this.solicitudCitaError.set('');
    this.solicitudCitaExito.set('');

    this.telegramCitas.solicitarCita(serviceId).pipe(
      timeout(8000),
      finalize(() => {
        this.solicitudCitaServicioId.set(null);
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (respuesta: any) => {
        const url = this.telegramCitas.extraerUrlTelegram(respuesta);
        if (!url) {
          this.solicitudCitaError.set('El backend no devolvió el enlace para la cita.');
          return;
        }

        // Guardar datos del enlace para mostrarlos en el template
        this.solicitudCitaEnlaceGenerado = true;
        this.solicitudCitaUrl = url;
        this.solicitudCitaDeepLink = `tg://resolve?domain=ConnectopiaHNBot&start=${respuesta.start_command || respuesta.payload || ''}`;
        this.solicitudCitaTelegramServicioNombre.set(this.obtenerNombreServicioDisponible(servicio));
        this.solicitudCitaTelegramComando.set(`/start ${respuesta.start_command || respuesta.payload || ''}`);
        this.solicitudCitaTelegramExpiraEn.set(respuesta.expires_in_minutes || null);
        this.solicitudCitaTokenVencido = false;

        // Abrir Telegram automáticamente
        this.telegramCitas.abrirTelegram(url);
        this.solicitudCitaExito.set('Solicitud enviada. Se abrió Telegram para completar la cita.');
      },
      error: (error: unknown) => {
        this.solicitudCitaError.set(
          this.extraerMensajeError(error, 'No se pudo iniciar la solicitud por Telegram.')
        );
      }
    });
  }

  abrirCitaTelegramDesktop(): void {
    if (!this.solicitudCitaDeepLink) {
      this.solicitudCitaError.set('Genera un enlace primero.');
      return;
    }
    this.telegramCitas.abrirTelegramDesktop(this.solicitudCitaDeepLink);
  }

  abrirCitaTelegramWeb(): void {
    if (!this.solicitudCitaUrl) {
      this.solicitudCitaError.set('Genera un enlace primero.');
      return;
    }
    this.telegramCitas.abrirTelegramWeb(this.solicitudCitaUrl);
  }

  copiarComandoCitaTelegram(): void {
    const comando = this.solicitudCitaTelegramComando();
    if (!comando) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(comando).then(() => {
        this.solicitudCitaExito.set('Comando copiado al portapapeles.');
        this.changeDetector.detectChanges();
      }).catch(() => {
        this.solicitudCitaError.set('No se pudo copiar automáticamente.');
      });
    } else {
      this.solicitudCitaError.set('Selecciona el comando y copialo manualmente.');
    }
  }

  // ============================================================
  // CITAS SOLICITADAS (historial del vecino)
  // ============================================================
  cargarCitas(): void {
    this.citasCargando.set(true);
    this.citasError.set('');

    this.telegramCitas.obtenerCitasPrestador().pipe(
      timeout(8000),
      catchError((error: unknown) => {
        console.error('Error al cargar citas:', error);
        this.citasError.set('No se pudieron cargar tus citas.');
        return of([] as SolicitudCita[]);
      }),
      finalize(() => {
        this.citasCargando.set(false);
        this.changeDetector.detectChanges();
      })
    ).subscribe((citas) => {
      // Filtrar para mostrar solo las del vecino
      const misCitas = citas.filter(c => c.neighbor_id === this.perfil?.id);
      this.citas.set(misCitas);
    });
  }

  actualizarCitas(): void {
    this.cargarCitas();
  }

  // ============================================================
  // UTILIDADES PARA MOSTRAR DATOS DE CITAS EN EL TEMPLATE
  // ============================================================
  obtenerNombreServicio(cita: SolicitudCita): string {
    return cita.service?.name ?? cita.service?.title ?? 'Servicio solicitado';
  }

  obtenerNombrePrestadorCita(cita: SolicitudCita): string {
    return cita.provider?.name ?? cita.provider?.email ?? 'Prestador';
  }

  obtenerCodigoCita(cita: SolicitudCita): string {
    return this.telegramCitas.obtenerCodigoSolicitud(cita);
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

  obtenerEtiquetaCita(estado: string | null | undefined): string {
    return this.telegramCitas.obtenerEtiquetaEstado(estado);
  }

  obtenerClaseEstadoCita(estado: string | null | undefined): string {
    return this.telegramCitas.obtenerClaseEstado(estado);
  }

  puedeAdministrarHistorial(cita: SolicitudCita): boolean {
    return ['delivery_failed', 'cancelled', 'expired', 'rejected'].includes(
      String(cita.status ?? '').toLowerCase()
    );
  }

  ocultarCita(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'hide');
  }

  archivarCita(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'archive');
  }

  eliminarCita(cita: SolicitudCita): void {
    this.actualizarHistorialCita(cita, 'delete');
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
        this.citas.set(this.citas().filter((item) => item.id !== cita.id));
        const mensaje: Record<AccionHistorialCita, string> = {
          hide: 'Cita ocultada del historial.',
          archive: 'Cita archivada.',
          delete: 'Cita eliminada.'
        };
        this.citaHistorialExito.set(mensaje[action]);
      },
      error: (error: unknown) => {
        this.citaHistorialError.set(
          this.extraerMensajeError(error, 'No se pudo actualizar el historial de la cita.')
        );
      }
    });
  }

  // ============================================================
  // MÉTODOS DE REFRESCO AUTOMÁTICO
  // ============================================================
  private refrescarDatosTelegram(): void {
    if (!isPlatformBrowser(this.platformId) || !this.perfil?.id) return;
    if (!localStorage.getItem('access_token')) return;

    const ahora = Date.now();
    if (ahora - this.ultimoRefreshTelegram < 1200) return;
    this.ultimoRefreshTelegram = ahora;

    this.cargarCitas();
    this.cargarServiciosDisponibles();
    // También se podría refrescar el perfil
    this.refrescarPerfilDesdeBackend(false);
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
      // Podríamos mostrar un indicador de carga si es necesario
    }

    this.http.get<Perfil | RespuestaPerfil>(
      WebServices.AuthMe,
      { headers: this.crearHeadersNgrok(token) }
    ).pipe(
      timeout(8000),
      map((respuesta) => this.extraerPerfil(respuesta)),
      catchError(() => of(null)),
      finalize(() => {
        this.changeDetector.detectChanges();
      })
    ).subscribe((perfil) => {
      if (!perfil) return;
      this.perfil = perfil;
      localStorage.setItem('user', JSON.stringify(perfil));
    });
  }

  // ============================================================
  // UTILIDADES PRIVADAS
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
      role: perfil.role || 'vecino',
      avatar_url: perfil.avatar_url ?? null,
      phone: perfil.phone ?? null,
      address: perfil.address ?? null,
      is_active: perfil.is_active ?? true,
      id_verified: perfil.id_verified ?? false,
      telegram_chat_id: perfil.telegram_chat_id ?? null
    };
  }
}