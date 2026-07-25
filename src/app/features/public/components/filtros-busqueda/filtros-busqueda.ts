import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtros-busqueda.html',
  styleUrls: ['./filtros-busqueda.css']
})
export class FiltrosBusquedaComponent {
  @Output() filtroCambiado = new EventEmitter<any>();
  filtros = { categoria: '', orden: 'reciente' };

  aplicarFiltros() {
    this.filtroCambiado.emit(this.filtros);
  }
}