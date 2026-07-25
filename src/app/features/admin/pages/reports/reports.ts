import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayout } from '../../../../core/layout/admin-layout/admin-layout';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, AdminLayout],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsPageComponent {
  // Aquí va la lógica de tu componente (copia de denuncias.ts)
}