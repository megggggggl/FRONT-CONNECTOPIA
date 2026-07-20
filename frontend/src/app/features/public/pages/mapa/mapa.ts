import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, MainLayout],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css']
})
export class MapaPageComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  loading = false;
  error = '';

  // Propiedades necesarias para el template
  servicios: any[] = [];
  lugares: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar mapa aquí
    }
  }

  obtenerUbicacion(): void {
    // Lógica de ubicación
  }

  recargarDatos(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}