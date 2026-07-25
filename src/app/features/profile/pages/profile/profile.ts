import { Component } from '@angular/core';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-profile',
  standalone: true,        // <-- Asegurar que esté presente
  imports: [MainLayout],   // <-- Importar MainLayout
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile { }