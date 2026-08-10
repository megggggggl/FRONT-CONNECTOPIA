import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlaceService } from '../../../../core/services/place.service';
import { Place } from '../../../../core/models/place.model';
import { MapaUbicacionComponent } from '../../../../compartido/componentes/mapa-ubicacion/mapa-ubicacion';

@Component({
  selector: 'app-detalle-lugar',
  standalone: true,
  imports: [CommonModule, RouterModule, MapaUbicacionComponent],
  templateUrl: './detalle-lugar.html'
})
export class DetalleLugarComponent implements OnInit {
  lugar: Place | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private placeService: PlaceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarLugar(id);
    } else {
      this.error = 'ID de lugar no válido';
      this.loading = false;
    }
  }

  cargarLugar(id: string): void {
    this.loading = true;
    this.placeService.obtenerLugar(id).subscribe({
      next: (lugar) => {
        this.lugar = lugar;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el lugar';
        this.loading = false;
      }
    });
  }

  obtenerCoordenadas(): { lat: number; lng: number } | null {
    if (!this.lugar?.location) return null;
    const [lng, lat] = this.lugar.location.coordinates;
    return { lat, lng };
  }

  obtenerHorario(): string[] {
    if (!this.lugar?.schedule) return [];
    const dias = [
      { key: 'monday', label: 'Lunes' },
      { key: 'tuesday', label: 'Martes' },
      { key: 'wednesday', label: 'Miércoles' },
      { key: 'thursday', label: 'Jueves' },
      { key: 'friday', label: 'Viernes' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' }
    ] as const;

    return dias
      .filter(d => Boolean(this.lugar!.schedule?.[d.key]))
      .map(d => `${d.label}: ${this.lugar!.schedule![d.key]}`);
  }
}