import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { Report } from '../../../core/models/report.model';

@Component({
  selector: 'app-denuncias-comunitarias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './denuncias.html',
  styleUrls: ['./denuncias.css']
})
export class DenunciasComunitariasComponent implements OnInit {
  denuncias: Report[] = [];
  loading = true;
  error = '';
  esAdmin = false;
  filtroEstado = 'todas';

  tipos: Record<string, string> = {
    bache: 'Bache',
    basura: 'Basura acumulada',
    alumbrado: 'Problema de alumbrado',
    seguridad: 'Inseguridad',
    agua: 'Problema de agua',
    otros: 'Otros'
  };

  prioridades: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente'
  };

  estados: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    resuelto: 'Resuelto',
    rechazado: 'Rechazado'
  };

  constructor(
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.getUserRole() === 'admin';
    this.cargarDenuncias();
  }

  cargarDenuncias(): void {
    this.loading = true;
    this.error = '';
    this.reportService.listarDenuncias().subscribe({
      next: (denuncias) => {
        this.denuncias = denuncias;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las denuncias';
        this.loading = false;
      }
    });
  }

  get denunciasFiltradas(): Report[] {
    if (this.filtroEstado === 'todas') return this.denuncias;
    return this.denuncias.filter(d => d.status === this.filtroEstado);
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      pendiente: 'estado-pendiente',
      en_proceso: 'estado-proceso',
      resuelto: 'estado-resuelto',
      rechazado: 'estado-rechazado'
    };
    return clases[estado] || '';
  }

  obtenerClasePrioridad(prioridad: string): string {
    const clases: Record<string, string> = {
      baja: 'prioridad-baja',
      media: 'prioridad-media',
      alta: 'prioridad-alta',
      urgente: 'prioridad-urgente'
    };
    return clases[prioridad] || '';
  }

  cambiarEstado(denuncia: Report, nuevoEstado: string): void {
    if (!this.esAdmin) return;
    if (!confirm(`¿Cambiar estado a "${this.estados[nuevoEstado]}"?`)) return;

    this.reportService.actualizarDenuncia(denuncia.id, {
      status: nuevoEstado as any,
      resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null
    }).subscribe({
      next: () => {
        denuncia.status = nuevoEstado as any;
        if (nuevoEstado === 'resuelto') denuncia.resolved_at = new Date().toISOString();
        alert('✅ Estado actualizado');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al actualizar estado');
      }
    });
  }
}