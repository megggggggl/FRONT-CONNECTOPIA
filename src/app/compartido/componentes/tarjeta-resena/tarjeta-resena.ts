import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-resena',
  imports: [CommonModule],
  templateUrl: './tarjeta-resena.html',
  styleUrl: './tarjeta-resena.css'
})
export class TarjetaResena {
  @Input() resena: any;

  obtenerCalificacionTexto(): string {
    return `${this.resena?.rating || 0}/5`;
  }
}