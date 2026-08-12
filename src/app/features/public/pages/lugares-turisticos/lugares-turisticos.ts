// src/app/features/public/pages/lugares-turisticos/lugares-turisticos.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlaceService } from '../../../../core/services/place.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Place } from '../../../../core/models/place.model';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-lugares-turisticos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lugares-turisticos.html',
  styleUrls: ['./lugares-turisticos.css']
})
export class LugaresTuristicosComponent implements OnInit, OnDestroy {
  lugares: Place[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  eliminandoLugarId: string | null = null;

  // Estado del formulario de creación
  modalAbierto = false;
  enviando = false;
  nuevoLugar: Partial<Place> = {
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    entrance_fee: '',
    images: [],
    schedule: {}
  };

  // Para la ubicación (opcional)
  ubicacion: { lat: number; lng: number } | null = null;
  private searchTimeoutId: number | null = null;

  constructor(
    private placeService: PlaceService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    this.cargarLugares();
  }

  ngOnDestroy(): void {
    if (this.searchTimeoutId !== null) window.clearTimeout(this.searchTimeoutId);
  }

  // ============================================================
  // LISTAR LUGARES
  // ============================================================
  cargarLugares(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {};
    if (this.searchTerm) filters.search = this.searchTerm;

    this.placeService.listarLugares(filters).subscribe({
      next: (data) => {
        this.lugares = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error = 'No se pudieron cargar los lugares turísticos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    if (this.searchTimeoutId !== null) window.clearTimeout(this.searchTimeoutId);
    this.searchTimeoutId = window.setTimeout(() => this.cargarLugares(), 250);
  }

  // ============================================================
  // MODAL DE CREACIÓN (solo autenticados)
  // ============================================================
  abrirModal(): void {
    if (!this.authService.isAuthenticated()) {
      this.feedback.info('Debes iniciar sesión para añadir un lugar turístico.');
      return;
    }
    this.modalAbierto = true;
    this.nuevoLugar = {
      name: '',
      description: '',
      address: '',
      phone: '',
      website: '',
      entrance_fee: '',
      images: [],
      schedule: {}
    };
    this.ubicacion = null;
    this.obtenerUbicacion();
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.enviando = false;
  }

  obtenerUbicacion(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Manejar imagen (base64)
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.nuevoLugar.images = [base64];
    };
    reader.readAsDataURL(file);
  }

  guardarLugar(): void {
    if (!this.nuevoLugar.name?.trim()) {
      this.feedback.info('El nombre es obligatorio.');
      return;
    }

    this.enviando = true;

    // Construir payload
    const payload: any = {
      name: this.nuevoLugar.name,
      description: this.nuevoLugar.description || null,
      address: this.nuevoLugar.address || null,
      phone: this.nuevoLugar.phone || null,
      website: this.nuevoLugar.website || null,
      entrance_fee: this.nuevoLugar.entrance_fee || null,
      images: this.nuevoLugar.images || [],
      schedule: this.nuevoLugar.schedule || null
    };

    // Si hay ubicación, agregarla como GeoJSON
    if (this.ubicacion) {
      payload.location = {
        type: 'Point',
        coordinates: [this.ubicacion.lng, this.ubicacion.lat]
      };
    }

    this.placeService.crearLugar(payload).subscribe({
      next: (nuevo) => {
        this.lugares = [nuevo, ...this.lugares];
        this.cerrarModal();
        this.cdr.detectChanges();
        this.feedback.success('Lugar turístico creado correctamente.');
      },
      error: (err) => {
        console.error('❌ Error al crear lugar:', err);
        this.feedback.error('No se pudo crear el lugar turístico.');
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }

  puedeEliminar(lugar: Place): boolean {
    const usuario = this.authService.getUser();
    return !!usuario && (String(lugar.created_by) === String(usuario.id) || this.authService.getUserRole() === 'admin');
  }

  async eliminarLugar(lugar: Place): Promise<void> {
    if (!this.puedeEliminar(lugar) || this.eliminandoLugarId) return;
    const confirmado = await this.feedback.confirm(
      `¿Querés eliminar "${lugar.name}"? Esta acción no se puede deshacer.`,
      { title: 'Eliminar lugar turístico', confirmText: 'Eliminar lugar', danger: true }
    );
    if (!confirmado) return;

    this.eliminandoLugarId = lugar.id;
    const indiceAnterior = this.lugares.findIndex((item) => item.id === lugar.id);
    this.lugares = this.lugares.filter((item) => item.id !== lugar.id);
    this.cdr.detectChanges();

    this.placeService.eliminarLugar(lugar.id).subscribe({
      next: () => {
        this.eliminandoLugarId = null;
        this.feedback.success('Lugar turístico eliminado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar lugar:', err);
        const posicion = indiceAnterior < 0 ? this.lugares.length : indiceAnterior;
        this.lugares = [
          ...this.lugares.slice(0, posicion),
          lugar,
          ...this.lugares.slice(posicion)
        ];
        this.eliminandoLugarId = null;
        this.feedback.error('No se pudo eliminar el lugar turístico.');
        this.cdr.detectChanges();
      }
    });
  }
}
