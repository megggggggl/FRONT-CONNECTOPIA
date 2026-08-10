import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-mapa-ubicacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mapa-container">
      <div *ngIf="!lat || !lng" class="sin-ubicacion">
        <span>📍 Ubicación no disponible</span>
      </div>
      <iframe
        *ngIf="lat && lng"
        [src]="iframeSrc"
        width="100%"
        height="100%"
        style="border:0; border-radius: 12px;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `,
  styles: [`
    .mapa-container {
      width: 100%;
      height: 300px;
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
    }
    .sin-ubicacion {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
      font-size: 16px;
    }
  `]
})
export class MapaUbicacionComponent implements OnInit {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() zoom = 15;
  @Input() markers: { lat: number; lng: number; label?: string }[] = [];

  iframeSrc: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.lat && this.lng) {
      const markers = this.markers.map(m =>
        `&markers=color:red%7C${m.lat},${m.lng}`
      ).join('');

      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${this.lng-0.01},${this.lat-0.01},${this.lng+0.01},${this.lat+0.01}&layer=mapnik&marker=${this.lat},${this.lng}`;
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}