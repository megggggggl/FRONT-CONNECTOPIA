import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seccion-dashboard',
  imports: [CommonModule],
  templateUrl: './seccion-dashboard.html',
  styleUrl: './seccion-dashboard.css'
})
export class SeccionDashboard {
  @Input() titulo = '';
  @Input() descripcion = '';
}