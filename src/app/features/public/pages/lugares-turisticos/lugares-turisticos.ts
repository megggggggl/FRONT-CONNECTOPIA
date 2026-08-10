// src/app/features/public/pages/lugares-turisticos/lugares-turisticos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlaceService } from '../../../../core/services/place.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Place } from '../../../../core/models/place.model';

@Component({
  selector: 'app-lugares-turisticos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lugares-turisticos.html',
  styleUrls: ['./lugares-turisticos.css']
})
export class LugaresTuristicosComponent implements OnInit {
  lugares: Place[] = [];
  loading = true;
  error = '';
  searchTerm = '';

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

  constructor(
    private placeService: PlaceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarLugares();
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
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error = 'No se pudieron cargar los lugares turísticos';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.cargarLugares();
  }

  // ============================================================
  // MODAL DE CREACIÓN (solo autenticados)
  // ============================================================
  abrirModal(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para añadir un lugar turístico.');
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
      alert('El nombre es obligatorio.');
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
        this.lugares.unshift(nuevo); // Agregar al inicio
        this.cerrarModal();
        alert('✅ Lugar turístico creado correctamente.');
      },
      error: (err) => {
        console.error('❌ Error al crear lugar:', err);
        alert('No se pudo crear el lugar turístico.');
        this.enviando = false;
      }
    });
  }
}