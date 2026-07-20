import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-encabezado-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encabezado-perfil.html',
  styleUrl: './encabezado-perfil.css'
})
export class EncabezadoPerfil {
  @Input() perfil: any;
  @Output() editarPerfil = new EventEmitter<void>();

  get inicialPerfil(): string {
    return this.perfil?.name?.charAt(0)?.toUpperCase() || 'P';
  }

  abrirEdicion(): void {
    this.editarPerfil.emit();
  }
}