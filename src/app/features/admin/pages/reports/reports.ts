import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MainLayout],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsPageComponent {
  // Aquí va la lógica de tu componente (copia de denuncias.ts)
}