import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-servicio',
  imports: [CommonModule],
  templateUrl: './tarjeta-servicio.html',
  styleUrl: './tarjeta-servicio.css'
})
export class TarjetaServicio {
  @Input() servicio: any;
  @Input() mostrarAccionCita = false;
  @Input() solicitandoCita = false;
  @Input() eliminando = false;
  @Output() solicitarCita = new EventEmitter<any>();
  @Output() eliminarServicio = new EventEmitter<any>();

  obtenerClaseEstado(): string {
    return `estado-${this.servicio?.status || 'pending'}`;
  }

  emitirSolicitudCita(): void {
    if (this.solicitandoCita) return;
    this.solicitarCita.emit(this.servicio);
  }

  emitirEliminarServicio(): void {
    if (this.eliminando) return;
    this.eliminarServicio.emit(this.servicio);
  }
}