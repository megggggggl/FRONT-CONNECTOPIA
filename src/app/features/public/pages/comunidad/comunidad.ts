import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicidadComponent } from '../../../../compartido/componentes/publicidad/publicidad.component';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicidadComponent],
  templateUrl: './comunidad.html',
  styleUrls: ['./comunidad.css']
})
export class ComunidadComponent {
  tipoFiltro: 'anuncio' | 'alerta' | 'evento' | 'general' | 'empleo' | '' = '';
  soloUrgentes = false;

  tipos = [
    { value: '', label: '📋 Todos' },
    { value: 'anuncio', label: '📢 Anuncios' },
    { value: 'alerta', label: '🚨 Alertas' },
    { value: 'evento', label: '📅 Eventos' },
    { value: 'general', label: '💬 General' },
    { value: 'empleo', label: '💼 Empleos' }
  ];

  onTipoChange(): void {}
  onUrgentesChange(): void {}
}