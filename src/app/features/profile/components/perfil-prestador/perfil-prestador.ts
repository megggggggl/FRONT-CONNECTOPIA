import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, timeout } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';
import { EncabezadoPerfil } from '../../../../compartido/componentes/encabezado-perfil/encabezado-perfil';
<<<<<<< HEAD

=======
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
import { Perfil, Resena, RespuestaLista, RespuestaPerfil, ServicioResumen } from '../../../../compartido/modelos/perfil.model';
import { AccionHistorialCita, SolicitudCita } from '../../../../compartido/modelos/appointment.model';
import { TelegramCitasService } from '../../../../compartido/servicios/appointment.service';

interface ServicioForm {
  name: string;
  description: string;
  price: string;
  address: string;
  phone: string;
  image: string;
}

@Component({
  selector: 'app-perfil-prestador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
<<<<<<< HEAD
    EncabezadoPerfil
    
    
=======
    EncabezadoPerfil,
    RouterLink
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
  ],
  templateUrl: './perfil-prestador.html',
  styleUrl: './perfil-prestador.css'
})
export class PerfilPrestador implements OnInit, OnDestroy {
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

  modalEditarAbierto = false;
  guardandoPerfil = false;
  errorGuardadoPerfil = '';
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

  formPerfil = {
    name: '',
    phone: '',
    address: '',
    avatar_url: ''
  };

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
    const perfilLocal = this.leerPerfilLocal();

    if (perfilLocal) {
      this.establecerPerfil(perfilLocal, !token);
    }

    if (!token) {
      if (!perfilLocal) {
        this.error = 'Iniciá sesión para ver el perfil del prestador.';
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

  abrirModalEditar(): void {
    this.formPerfil = {
      name: this.perfil?.name ?? '',
      phone: this.perfil?.phone ?? '',
      address: this.perfil?.address ?? '',
      avatar_url: this.perfil?.avatar_url ?? ''
    };

    this.errorGuardadoPerfil = '';
    this.modalEditarAbierto = true;
    this.changeDetector.detectChanges();
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
  }

  guardarPerfil(): void {
    if (!this.perfil?.id || this.guardandoPerfil) return;

    const token = this.obtenerToken();
    if (!token) {
      this.errorGuardadoPerfil = 'Tu sesión expiró. Iniciá sesión nuevamente.';
      this.changeDetector.detectChanges();
      return;
    }

    if (!this.formPerfil.name.trim()) {
      this.errorGuardadoPerfil = 'El nombre es obligatorio.';
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
    this.errorGuardadoPerfil = '';

    this.http.patch<Perfil | RespuestaPerfil>(
      WebServices.ProfileUpdate(this.perfil.id),
      datosActualizados,
      { headers: this.crearHeadersNgrok(token) }
    ).subscribe({
      next: (respuesta: any) => {
        const perfilActualizado = this.extraerPerfil(respuesta) ?? {
          ...this.perfil!,
          ...datosActualizados
        };

        this.perfil = perfilActualizado;
        localStorage.setItem('user', JSON.stringify(perfilActualizado));
        this.modalEditarAbierto = false;
        this.guardandoPerfil = false;
        this.changeDetector.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Error al actualizar perfil:', error);
        this.errorGuardadoPerfil = 'No se pudo guardar el perfil en el servidor.';
        this.guardandoPerfil = false;
        this.changeDetector.detectChanges();
      }
    });
  }

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
      return total + Number(servicio.avg_rating ?? 0) * Number(servicio.reviews_count ?? 0);
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

  vincularTelegram(): void {
    if (this.telegramCargando) return;

    if (this.telegramEnlaceGenerado && !this.telegramTokenVencido) {
      this.abrirTelegramDesktop();
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
      next: (respuesta: any) => {
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
        this.telegramUrl = this.telegramCitas.crearLinkTelegramWeb(payload) ;
        this.telegramExpiraEn = respuesta.expires_in_minutes
          ?? respuesta.data?.expires_in_minutes
          ?? null;
        this.telegramGeneradoEn = Date.now();

        this.telegramCitas.abrirTelegram(this.telegramDeepLink);
        this.programarLimpiezaTelegram();
        this.telegramExito = 'Enlace generado. Intentamos abrir Telegram Desktop. Si no se abre automaticamente, copia el comando y envialo a @ConnectopiaHNBot.';
      },
      error: (error: unknown) => {
        this.telegramError = this.extraerMensajeError(
          error,
          'No se pudo generar el enlace de Telegram.'
        );
      }
    });
  }

  abrirUltimoEnlaceTelegram(): void {
    this.abrirTelegramWeb();
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

  actualizarEstadoTelegram(): void {
    this.refrescarPerfilDesdeBackend(true);
  }

  actualizarCitasRecibidas(): void {
    this.cargarCitasRecibidas(true);
  }

  abrirModalCrearServicio(): void {
    this.formServicio = this.crearFormularioServicio();
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

    this.http.post<ServicioResumen>(
      WebServices.ServicesCreate,
      payload,
      { headers: this.crearHeadersNgrok(this.obtenerToken()) }
    ).pipe(
      timeout(8000),
      finalize(() => {
        this.servicioGuardando = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (servicio: ServicioResumen) => {
        this.servicios = [servicio, ...this.servicios.filter((item) => item.id !== servicio.id)];
        this.modalServicioAbierto = false;
        this.formServicio = this.crearFormularioServicio();
        this.servicioExito = servicio.status === 'active'
          ? 'Servicio publicado y visible para vecinos.'
          : 'Servicio creado. Se activara cuando vincules Telegram.';
        this.cargarServicios(this.perfil!.id);
      },
      error: (error: unknown) => {
        this.servicioError = this.extraerMensajeError(error, 'No se pudo crear el servicio.');
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
      error: (error: unknown) => {
        this.servicioError = this.extraerMensajeError(error, 'No se pudo eliminar el servicio.');
      }
    });
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
      next: (respuesta: any) => {
        const url = this.telegramCitas.extraerUrlTelegram(respuesta);

        if (!url) {
          this.citaError = 'El backend no devolvio el enlace para la cita.';
          return;
        }

        this.telegramCitas.abrirTelegram(url);
      },
      error: (error: unknown) => {
        this.citaError = this.extraerMensajeError(
          error,
          'No se pudo iniciar la solicitud por Telegram.'
        );
      }
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
      next: (servicios: ServicioResumen[]) => {
        this.servicios = servicios.filter(
          (servicio) => String(servicio.provider_id) === String(idPrestador)
        );

        this.resenas = [];
        this.cargando = false;
        this.changeDetector.detectChanges();
        this.cargarResenasServicios(this.servicios);
      },
      error: (error: unknown) => {
        console.error('Error al cargar servicios del prestador:', error);
        this.error = 'No se pudo cargar la actividad del perfil.';
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
          return resenas.map((resena: Resena) => ({
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
      catchError((error: unknown) => {
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
    ).subscribe((citas: SolicitudCita[]) => {
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
      error: (error: unknown) => {
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

  private crearFormularioServicio(): ServicioForm {
    return {
      name: '',
      description: '',
      price: '',
      address: '',
      phone: '',
      image: ''
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
}
