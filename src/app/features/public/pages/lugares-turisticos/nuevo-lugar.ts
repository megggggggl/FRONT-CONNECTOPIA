import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlaceService } from '../../../../core/services/place.service';

@Component({
  selector: 'app-nuevo-lugar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nuevo-lugar.html',
  styleUrls: ['./nuevo-lugar.css']
})
export class NuevoLugarComponent {
  lugar = {
    name: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    images: [] as string[],
    entrance_fee: '',
    schedule: {} as any,
    location: null as { lat: number; lng: number } | null
  };

  enviando = false;

  constructor(
    private placeService: PlaceService,
    private router: Router
  ) {}

  guardar() {
    if (!this.lugar.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    this.enviando = true;

    const payload: any = {
      name: this.lugar.name,
      description: this.lugar.description || null,
      address: this.lugar.address || null,
      phone: this.lugar.phone || null,
      website: this.lugar.website || null,
      images: this.lugar.images,
      entrance_fee: this.lugar.entrance_fee || null,
      schedule: this.lugar.schedule || null,
      location: this.lugar.location ? {
        type: 'Point',
        coordinates: [this.lugar.location.lng, this.lugar.location.lat]
      } : null
    };

    this.placeService.crearLugar(payload).subscribe({
      next: () => {
        this.enviando = false;
        alert('Lugar creado correctamente');
        this.router.navigate(['/lugares-turisticos']);
      },
      error: (err) => {
        this.enviando = false;
        console.error('❌ Error al crear lugar:', err);
        alert('No se pudo crear el lugar');
      }
    });
  }

  // Método para obtener ubicación desde el navegador
  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lugar.location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
        },
        () => {
          alert('No se pudo obtener la ubicación');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización');
    }
  }
}
