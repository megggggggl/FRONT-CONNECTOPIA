// src/app/features/public/pages/mapa/mapa.component.ts
import { Component, AfterViewInit, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebServices } from '../../../../core/services/webServices';
import { AuthService } from '../../../../core/services/auth.service';

declare let L: any;

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css']
})
export class MapaComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private map: any;
  private markers: any[] = [];
  private ubicacionUsuario: { lat: number; lng: number } | null = null;

  tiposFiltro = [
    { key: 'eventos', label: 'Eventos', icon: 'fa-solid fa-calendar-day', checked: true, color: '#0a7e6f' },
    { key: 'servicios', label: 'Servicios', icon: 'fa-solid fa-screwdriver-wrench', checked: true, color: '#3b82f6' },
    { key: 'lugares', label: 'Lugares turísticos', icon: 'fa-solid fa-landmark', checked: true, color: '#f59e0b' },
    { key: 'denuncias', label: 'Denuncias', icon: 'fa-solid fa-triangle-exclamation', checked: true, color: '#dc2626' },
    { key: 'paradas', label: 'Paradas de bus', icon: 'fa-solid fa-bus-simple', checked: true, color: '#8b5cf6' }
  ];

  colores = [
    { label: 'Eventos', color: '#0a7e6f' },
    { label: 'Servicios', color: '#3b82f6' },
    { label: 'Lugares Turísticos', color: '#f59e0b' },
    { label: 'Denuncias', color: '#dc2626' },
    { label: 'Paradas de Bus', color: '#8b5cf6' }
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Esperar un tick para asegurar que el DOM esté listo
    setTimeout(() => {
      this.inicializarMapa();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    // Verificar que el contenedor existe
    const container = document.getElementById('map');
    if (!container) {
      console.error('❌ Contenedor del mapa no encontrado');
      return;
    }

    // Inicializar el mapa
    this.map = L.map('map', { center: [14.1, -87.2], zoom: 13 });

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Esperar a que el mapa esté listo antes de cargar datos
    this.map.whenReady(() => {
      this.obtenerUbicacion();
      this.cargarDatos();
    });
  }

  private obtenerUbicacion(): void {
    if (!this.isBrowser) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ubicacionUsuario = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.map.setView([this.ubicacionUsuario.lat, this.ubicacionUsuario.lng], 14);
        this.agregarMarcador(
          this.ubicacionUsuario.lat,
          this.ubicacionUsuario.lng,
          'Tú estás aquí',
          '',
          'fa-solid fa-location-dot',
          '#3b82f6'
        );
      },
      (err) => {
        console.warn('⚠️ No se pudo obtener la ubicación:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  irMiUbicacion(): void {
    if (this.ubicacionUsuario) {
      this.map.setView([this.ubicacionUsuario.lat, this.ubicacionUsuario.lng], 14);
    } else {
      this.obtenerUbicacion();
    }
  }

  cargarDatos(): void {
    this.limpiarMarkers();

    if (this.tiposFiltro.find(t => t.key === 'eventos' && t.checked)) {
      this.cargarEventos();
    }
    if (this.tiposFiltro.find(t => t.key === 'servicios' && t.checked)) {
      this.cargarServicios();
    }
    if (this.tiposFiltro.find(t => t.key === 'lugares' && t.checked)) {
      this.cargarLugares();
    }
    if (this.tiposFiltro.find(t => t.key === 'denuncias' && t.checked)) {
      this.cargarDenuncias();
    }
    if (this.tiposFiltro.find(t => t.key === 'paradas' && t.checked)) {
      this.cargarParadas();
    }
  }

  actualizarMapa(): void {
    this.cargarDatos();
  }

  private limpiarMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
  }

  // ============================================================
  // CARGA DE DATOS CON MANEJO DE ERRORES
  // ============================================================
  private cargarEventos(): void {
    this.http.get<any>(WebServices.EventsList).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (resp) => {
        const eventos = resp.data || resp || [];
        eventos.forEach((e: any) => {
          if (e.location?.coordinates?.length === 2) {
            const [lng, lat] = e.location.coordinates;
            this.agregarMarcador(lat, lng, e.title, e.description, 'fa-solid fa-calendar-day', '#0a7e6f');
          }
        });
      },
      error: () => {}
    });
  }

  private cargarServicios(): void {
    this.http.get<any>(WebServices.ServicesList).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (resp) => {
        const servicios = resp.data || resp || [];
        servicios.forEach((s: any) => {
          if (s.location?.coordinates?.length === 2) {
            const [lng, lat] = s.location.coordinates;
            this.agregarMarcador(lat, lng, s.name, s.description, 'fa-solid fa-screwdriver-wrench', '#3b82f6');
          }
        });
      },
      error: () => {}
    });
  }

  private cargarLugares(): void {
    this.http.get<any>(WebServices.PlacesList).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (resp) => {
        const lugares = resp.data || resp || [];
        lugares.forEach((l: any) => {
          if (l.location?.coordinates?.length === 2) {
            const [lng, lat] = l.location.coordinates;
            this.agregarMarcador(lat, lng, l.name, l.description, 'fa-solid fa-landmark', '#f59e0b');
          }
        });
      },
      error: () => {}
    });
  }

  private cargarDenuncias(): void {
    this.http.get<any>(WebServices.ReportsList).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (resp) => {
        const denuncias = resp.data || resp || [];
        denuncias.forEach((d: any) => {
          if (d.location?.coordinates?.length === 2) {
            const [lng, lat] = d.location.coordinates;
            this.agregarMarcador(lat, lng, d.title, d.description, 'fa-solid fa-triangle-exclamation', '#dc2626');
          }
        });
      },
      error: () => {}
    });
  }

  private cargarParadas(): void {
    this.http.get<any>(WebServices.BusStopsList).pipe(
      catchError(() => of({ data: [] }))
    ).subscribe({
      next: (resp) => {
        const paradas = resp.data || resp || [];
        paradas.forEach((p: any) => {
          if (p.location?.coordinates?.length === 2) {
            const [lng, lat] = p.location.coordinates;
            this.agregarMarcador(lat, lng, p.name, p.address || 'Parada de bus', 'fa-solid fa-bus-simple', '#8b5cf6');
          }
        });
      },
      error: () => {}
    });
  }

  // ============================================================
  // AGREGAR MARCADOR CON SEGURIDAD
  // ============================================================
  private agregarMarcador(lat: number, lng: number, titulo: string, desc: string, icono: string, color: string) {
    if (!this.map || !lat || !lng) return;

    try {
      const icon = L.divIcon({
        html: `<div style="background:${color};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="${icono}" aria-hidden="true"></i></div>`,
        className: '',
        iconSize: [28, 28]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(this.map);
      marker.bindPopup(`<strong>${titulo}</strong><br>${desc || ''}`);
      this.markers.push(marker);
    } catch (e) {
      console.warn('⚠️ Error al agregar marcador:', e);
    }
  }
}
