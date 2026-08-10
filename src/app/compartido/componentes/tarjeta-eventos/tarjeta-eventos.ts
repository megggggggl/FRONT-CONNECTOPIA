// tarjeta-evento.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define la interfaz con los mismos tipos que vienen del backend
export interface Evento {
  id: string;
  title: string;
  description: string | null;  // ← acepta null
  start_date: string;
  end_date?: string | null;
  address?: string | null;
  images?: string[];
  max_participants?: number | null;
  current_participants?: number;
  status: string;
  organizer_id?: string;
}

@Component({
  selector: 'app-tarjeta-evento',
  standalone: true,
  imports: [CommonModule],  // ← necesario para directivas y pipes
  templateUrl: './tarjeta-eventos.html',
  styleUrls: ['./tarjeta-eventos.css']
})
export class TarjetaEvento {
  @Input() evento!: Evento;
  @Input() estaInscrito = false;
  @Input() registrandose = false;
  @Input() cancelandoRegistro = false;
  @Input() esAdmin = false;
  @Input() eliminando = false;

  @Output() registrarse = new EventEmitter<string>();
  @Output() cancelarRegistro = new EventEmitter<string>();
  @Output() eliminarEvento = new EventEmitter<string>();
@Input() rsvpStatus: 'none' | 'interested' | 'attending' = 'none';
@Input() rsvpCounts: { total: number; confirmados: number; interesados: number } = { total: 0, confirmados: 0, interesados: 0 };
@Output() rsvpChange = new EventEmitter<{ eventId: string; status: string }>();

rsvp(status: 'interested' | 'attending' | 'not_attending'): void {
  this.rsvpChange.emit({ eventId: this.evento.id, status });
}
  obtenerClaseEstado(): string {
    const estado = this.evento?.status || 'programado';
    return `estado-${estado}`;
  }

  obtenerCupo(): string {
    const actual = Number(this.evento?.current_participants ?? 0);
    const maximo = this.evento?.max_participants;
    return maximo == null ? `${actual} / sin límite` : `${actual} / ${maximo}`;
  }

  emitirRegistrarse(): void {
    if (this.registrandose || !this.evento) return;
    this.registrarse.emit(this.evento.id);
  }

  emitirCancelarRegistro(): void {
    if (this.cancelandoRegistro || !this.evento) return;
    this.cancelarRegistro.emit(this.evento.id);
  }

  emitirEliminar(): void {
    if (this.eliminando || !this.evento) return;
    this.eliminarEvento.emit(this.evento.id);
  }
}