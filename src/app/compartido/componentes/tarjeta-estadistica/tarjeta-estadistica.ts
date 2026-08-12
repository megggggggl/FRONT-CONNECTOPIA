import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-estadistica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-estadistica.html',
  styleUrl: './tarjeta-estadistica.css'
})
export class TarjetaEstadistica {
  @Input() titulo = '';
  @Input() valor: number | string = 0;
  @Input() descripcion = '';
  @Input() icono = '';
}
