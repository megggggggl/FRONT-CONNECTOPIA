import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayout } from '../../../../core/layout/admin-layout/admin-layout';

@Component({
  selector: 'app-gestiones',
  standalone: true,
  imports: [CommonModule, AdminLayout],
  templateUrl: './gestiones.html',
  styleUrls: ['./gestiones.css']
})
export class GestionesPageComponent {
  // Aquí va la lógica de tu componente
}