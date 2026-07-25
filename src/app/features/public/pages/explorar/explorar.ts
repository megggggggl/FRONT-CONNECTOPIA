import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicidadComponent } from '../../../../compartido/componentes/publicidad/publicidad.component';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, PublicidadComponent], // ✅ Solo lo necesario
  templateUrl: './explorar.html',
  styleUrls: ['./explorar.css']
})
export class ExplorarPageComponent {
  hoy = new Date();
}