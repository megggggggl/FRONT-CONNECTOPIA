// src/app/features/public/pages/servicios/servicios.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TarjetaServicio } from '../../../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';
import { ServiceService, Service } from '../../../../core/services/service.service';
import { CategoryService, Category } from '../../../../core/services/category.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TelegramCitasService } from '../../../../compartido/servicios/appointment.service';
import { WebServices } from '../../../../core/services/webServices';
import { CalificarServicioModal } from '../../../../compartido/componentes/calificarServicio/calificarServicio';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TarjetaServicio,
 
    CalificarServicioModal
  ],
  templateUrl: './servicios.html',
  styleUrls: ['./servicios.css']
})
export class ServiciosPageComponent implements OnInit {
  servicios: Service[] = [];
  categorias: Category[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filtroCategoria = '';
  ordenPor = 'reciente';
  filtroEspecial = 'todos';

  // Favoritos
  favoritosIds: Set<string> = new Set();
  favoritosMap: Map<string, number> = new Map();

  ubicacion: { lat: number; lng: number } | null = null;
  cargandoUbicacion = false;
  serviciosFrecuentesIds: Set<string> = new Set();
  solicitandoMap: Record<string, boolean> = {};
  eliminandoMap: Record<string, boolean> = {};

  // Modales
  modalDenunciaAbierto = false;
  modalCalificacionAbierto = false;
  servicioParaDenunciar: Service | null = null;
  servicioParaCalificarId: string | null = null;
  misCitas: any[] = [];

  constructor(
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private telegramCitas: TelegramCitasService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarServicios();
    this.cargarDatosUsuario();
  }

  // ============================================================
  // GETTER SERVICIOS FILTRADOS
  // ============================================================
  get serviciosFiltrados(): Service[] {
    let result = this.servicios;

    if (this.filtroCategoria) {
      result = result.filter(s => s.category_id === Number(this.filtroCategoria));
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(term));
    }

    if (this.filtroEspecial === 'frecuentes') {
      result = result.filter(s => this.serviciosFrecuentesIds.has(s.id));
    } else if (this.filtroEspecial === 'cercanos') {
      if (this.ubicacion) {
        result = [...result].sort((a, b) => {
          const distA = this.calcularDistancia(
            this.ubicacion!.lat,
            this.ubicacion!.lng,
            a.latitude,
            a.longitude
          );
          const distB = this.calcularDistancia(
            this.ubicacion!.lat,
            this.ubicacion!.lng,
            b.latitude,
            b.longitude
          );
          return distA - distB;
        });
      }
    }

    if (this.ordenPor === 'nombre') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.ordenPor === 'reciente') {
      result = [...result].sort((a, b) => {
        const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return fechaB - fechaA;
      });
    } else if (this.ordenPor === 'popular') {
      result = [...result].sort((a, b) => {
        const ratingA = Number(a.avg_rating ?? 0);
        const ratingB = Number(b.avg_rating ?? 0);
        return ratingB - ratingA;
      });
    }

    return result;
  }

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  cargarCategorias(): void {
    this.categoryService.listarCategorias('service').subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  cargarServicios(): void {
    this.loading = true;
    this.error = '';
    this.serviceService.listarServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.error = 'No se pudieron cargar los servicios.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDatosUsuario(): void {
    if (!this.authService.isAuthenticated()) return;
    this.cargarFavoritos();
    this.telegramCitas.obtenerMisCitas().subscribe({
      next: (citas) => {
        this.misCitas = citas;
        const ids = citas.map(c => c.service_id).filter(id => id) as string[];
        this.serviciosFrecuentesIds = new Set(ids);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar citas:', err)
    });
  }

  // ============================================================
  // FAVORITOS - CON ID PARA ELIMINAR
  // ============================================================
  cargarFavoritos(): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.http.get(WebServices.FavoritesList, {
      headers: this.crearHeaders()
    }).subscribe({
      next: (resp: any) => {
        const items = resp?.data || [];
        this.favoritosMap.clear();
        this.favoritosIds.clear();
        items.forEach((item: any) => {
          this.favoritosMap.set(item.entity_id, item.id);
          this.favoritosIds.add(item.entity_id);
        });
        console.log('✅ Favoritos cargados:', this.favoritosIds.size);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
      }
    });
  }

  // ============================================================
  // TOGGLE FAVORITO - DESDE LA TARJETA
  // ============================================================
  onToggleFavorito(event: { id: string; favorito: boolean }): void {
    const serviceId = event.id;

    if (event.favorito) {
      // AGREGAR FAVORITO
      this.http.post(WebServices.FavoritesAdd, {
        entity_type: 'service',
        entity_id: serviceId
      }, { headers: this.crearHeaders() }).subscribe({
        next: (resp: any) => {
          const newFavId = resp?.data?.id;
          if (newFavId) {
            this.favoritosMap.set(serviceId, newFavId);
            this.favoritosIds.add(serviceId);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al agregar favorito:', err);
          this.favoritosIds.delete(serviceId);
          this.cdr.detectChanges();
          alert('No se pudo agregar a favoritos');
        }
      });
    } else {
      // ELIMINAR FAVORITO
      const favoritoId = this.favoritosMap.get(serviceId);
      if (!favoritoId) {
        this.cargarFavoritos();
        return;
      }
      this.http.delete(WebServices.FavoritesRemove(favoritoId), {
        headers: this.crearHeaders()
      }).subscribe({
        next: () => {
          this.favoritosMap.delete(serviceId);
          this.favoritosIds.delete(serviceId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al eliminar favorito:', err);
          this.favoritosIds.add(serviceId);
          this.cdr.detectChanges();
          alert('No se pudo eliminar de favoritos');
        }
      });
    }
  }

  // ============================================================
  // HEADERS
  // ============================================================
  private crearHeaders(): any {
    const token = localStorage.getItem('access_token');
    return {
      'ngrok-skip-browser-warning': 'true',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // ============================================================
  // GEOLOCALIZACIÓN
  // ============================================================
  obtenerUbicacion(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada');
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    this.cargandoUbicacion = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ubicacion = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
      },
      (err) => {
        console.error('Error al obtener ubicación:', err);
        this.cargandoUbicacion = false;
        this.cdr.detectChanges();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private calcularDistancia(lat1: number, lng1: number, lat2?: number, lng2?: number): number {
    if (!lat2 || !lng2) return Infinity;
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number { return deg * (Math.PI / 180); }

  // ============================================================
  // FILTROS
  // ============================================================
  onSearch(): void {}
  onCategoryChange(): void {}
  onOrderChange(): void {}

  onFiltroEspecialChange(): void {
    if (this.filtroEspecial === 'cercanos' && !this.ubicacion) {
      this.obtenerUbicacion();
    }
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroCategoria = '';
    this.ordenPor = 'reciente';
    this.filtroEspecial = 'todos';
  }

  // ============================================================
  // MODAL DENUNCIA
  // ============================================================
  abrirModalDenuncia(servicio: Service): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para denunciar');
      return;
    }
    this.servicioParaDenunciar = servicio;
    this.modalDenunciaAbierto = true;
  }

  cerrarModalDenuncia(): void {
    this.modalDenunciaAbierto = false;
    this.servicioParaDenunciar = null;
  }

  // ============================================================
  // MODAL CALIFICAR (FUNCIONAL)
  // ============================================================
  abrirModalCalificacion(serviceId: string): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para calificar');
      return;
    }
    this.servicioParaCalificarId = serviceId;
    this.modalCalificacionAbierto = true;
    console.log('🔓 Modal calificación abierto para servicio:', serviceId);
  }

  cerrarModalCalificacion(): void {
    this.modalCalificacionAbierto = false;
    this.servicioParaCalificarId = null;
    console.log('🔒 Modal calificación cerrado');
  }

  // ============================================================
  // SOLICITAR CITA
  // ============================================================
  onSolicitarCita(servicio: Service): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para solicitar una cita.');
      return;
    }
    const id = servicio.id;
    if (!id) return;
    if (this.solicitandoMap[id]) return;

    this.solicitandoMap[id] = true;
    this.telegramCitas.solicitarCita(id).subscribe({
      next: (respuesta) => {
        const link = this.telegramCitas.extraerUrlTelegram(respuesta);
        if (link) {
          this.telegramCitas.abrirTelegramWeb(link);
        } else {
          const payload = this.telegramCitas.extraerPayloadInicio(respuesta);
          if (payload) {
            window.open(`https://t.me/ConnectopiaHNBot?start=${payload}`, '_blank');
          } else {
            alert('No se pudo obtener el enlace de Telegram.');
          }
        }
        this.solicitandoMap[id] = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al solicitar cita:', error);
        alert('No se pudo generar la solicitud. Intenta más tarde.');
        this.solicitandoMap[id] = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // VERIFICAR SI PUEDE CALIFICAR
  // ============================================================
  puedeCalificar(serviceId: string): boolean {
    return this.misCitas.some(c =>
      c.service_id === serviceId &&
      (c.status === 'completed' || c.status === 'accepted')
    );
  }

  // ============================================================
  // RECARGAR FAVORITOS (para el dashboard)
  // ============================================================
  recargarFavoritos(): void {
    this.cargarFavoritos();
  }

  puedeEliminar(servicio: Service): boolean {
    const usuario = this.authService.getUser();
    if (!usuario) return false;
    const rol = this.authService.getUserRole();
    if (rol === 'admin') return true;
    const usuarioId = String(usuario.id ?? usuario.profile_id ?? usuario.user_id ?? '');
    return rol === 'prestador' && !!usuarioId && String(servicio.provider_id) === usuarioId;
  }

  async eliminarServicio(servicio: Service): Promise<void> {
    if (!servicio.id || this.eliminandoMap[servicio.id] || !this.puedeEliminar(servicio)) return;
    const confirmado = await this.feedback.confirm(
      `¿Querés eliminar el servicio "${servicio.name}"?`,
      { title: 'Eliminar servicio', confirmText: 'Eliminar', danger: true }
    );
    if (!confirmado) return;

    const indice = this.servicios.findIndex((item) => item.id === servicio.id);
    this.eliminandoMap[servicio.id] = true;
    this.servicios = this.servicios.filter((item) => item.id !== servicio.id);
    this.cdr.detectChanges();

    this.serviceService.eliminarServicio(servicio.id).subscribe({
      next: () => {
        delete this.eliminandoMap[servicio.id];
        this.favoritosIds.delete(servicio.id);
        this.favoritosMap.delete(servicio.id);
        this.feedback.success('Servicio eliminado correctamente.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        delete this.eliminandoMap[servicio.id];
        const posicion = indice >= 0 ? indice : this.servicios.length;
        this.servicios = [...this.servicios.slice(0, posicion), servicio, ...this.servicios.slice(posicion)];
        console.error('Error al eliminar servicio:', error);
        this.feedback.error('No se pudo eliminar el servicio.');
        this.cdr.detectChanges();
      }
    });
  }
}
