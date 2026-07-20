import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tarjeta-actividad',
  imports: [CommonModule],
  templateUrl: './tarjeta-actividad.html',
  styleUrl: './tarjeta-actividad.css'
})
export class TarjetaActividad {
  @Input() titulo = '';
  @Input() valor: string | number = '';
  @Input() descripcion = '';
  @Input() rutaImagen = '';
}