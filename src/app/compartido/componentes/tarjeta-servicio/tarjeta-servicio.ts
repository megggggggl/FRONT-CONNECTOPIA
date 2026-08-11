// src/app/compartido/componentes/tarjeta-servicio/tarjeta-servicio.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-servicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-servicio.html',
  styleUrls: ['./tarjeta-servicio.css']
})
export class TarjetaServicio {
  @Input() servicio: any;
  @Input() mostrarAccionCita = false;
  @Input() solicitandoCita = false;
  @Input() esFavorito = false;
  @Input() mostrarCalificar = false;
  @Input() mostrarEliminar = false;
  @Input() eliminando = false;
  @Output() toggleFavorito = new EventEmitter<{ id: string; favorito: boolean }>();
  @Output() solicitarCita = new EventEmitter<any>();
  @Output() calificar = new EventEmitter<string>();
  @Output() eliminar = new EventEmitter<any>();

  toggleFavoritoEvent(): void {
    if (!this.servicio) return;
    this.toggleFavorito.emit({
      id: this.servicio.id,
      favorito: !this.esFavorito
    });
  }

  emitirSolicitudCita(): void {
    if (this.solicitandoCita) return;
    this.solicitarCita.emit(this.servicio);
  }

  obtenerClaseEstado(): string {
    return `estado-${this.servicio?.status || 'pending'}`;
  }
}
