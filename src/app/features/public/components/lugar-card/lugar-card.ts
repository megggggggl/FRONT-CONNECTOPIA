// src/app/features/public/components/lugar-card/lugar-card.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lugar-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lugar-card.html',
  styleUrls: ['./lugar-card.css']
})
export class LugarCardComponent {
  @Input() lugar: any;
  @Input() mostrarAccion = false; // Botón "Ver más" o "Visitar"
  @Output() accion = new EventEmitter<any>();

  get imagenPrincipal(): string {
    return this.lugar?.images?.length ? this.lugar.images[0] : '';
  }

  get tieneImagen(): boolean {
    return !!this.imagenPrincipal;
  }

  get nombre(): string {
    return this.lugar?.name || 'Lugar sin nombre';
  }

  get descripcion(): string {
    return this.lugar?.description || 'Sin descripción disponible.';
  }

  get precioEntrada(): string {
    return this.lugar?.entrance_fee ? `L ${this.lugar.entrance_fee}` : 'Entrada libre';
  }

  get calificacion(): number {
    return this.lugar?.avg_rating || 0;
  }

  get totalResenas(): number {
    return this.lugar?.reviews_count || 0;
  }

  get esDestacado(): boolean {
    return !!this.lugar?.is_featured;
  }

  get estadoClase(): string {
    return this.esDestacado ? 'estado-destacado' : 'estado-normal';
  }

  get estadoTexto(): string {
    return this.esDestacado ? '⭐ Destacado' : 'Lugar turístico';
  }

  emitirAccion(): void {
    if (this.mostrarAccion) {
      this.accion.emit(this.lugar);
    }
  }
}