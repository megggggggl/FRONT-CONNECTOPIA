// src/app/features/admin/pages/moderation/moderation.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';
import { FeedbackService } from '../../../../core/services/feedback.service';

interface ReporteContenido {
  id: number;
  reporter_id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  description: string | null;
  status: 'pendiente' | 'revisado' | 'resuelto' | 'rechazado';
  created_at: string;
  resolved_at?: string;
  reporter?: { name: string; email: string };
  entity?: any;
}

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderation.html',
  styleUrls: ['./moderation.css']
})
export class ModerationPageComponent implements OnInit {
  reportes: ReporteContenido[] = [];
  reportesFiltrados: ReporteContenido[] = [];
  loading = false;
  error = '';
  success = '';
  filtroEstado = 'todos';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado. Inicia sesión como administrador.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    console.log('📡 Cargando reportes desde:', WebServices.ContentReportsList);

    this.http.get<any>(WebServices.ReportsList, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('❌ Error al cargar reportes:', err);
          this.error = err.error?.error || 'Error al cargar reportes.';
          return of({ data: [] });
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => {
          console.log('✅ Reportes recibidos:', resp);
          const lista = Array.isArray(resp) ? resp : resp.data ?? [];
          this.reportes = lista.map((reporte: any) => ({
            id: reporte.id,
            reporter_id: reporte.author_id,
            entity_type: reporte.type || 'report',
            entity_id: String(reporte.id),
            reason: reporte.title,
            description: reporte.description,
            status: reporte.status === 'en_proceso' ? 'revisado' : reporte.status,
            created_at: reporte.created_at,
            resolved_at: reporte.resolved_at,
            reporter: reporte.author
          }));
          this.aplicarFiltros();
        }
      });
  }

  aplicarFiltros(): void {
    if (this.filtroEstado === 'todos') {
      this.reportesFiltrados = this.reportes;
    } else {
      this.reportesFiltrados = this.reportes.filter(r => r.status === this.filtroEstado);
    }
    console.log('📋 Reportes filtrados:', this.reportesFiltrados.length);
  }

  async cambiarEstado(reporte: ReporteContenido, nuevoEstado: string): Promise<void> {
    if (!await this.feedback.confirm(`¿Cambiar estado a "${nuevoEstado}"?`, { title: 'Actualizar reporte', confirmText: 'Actualizar' })) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = {
      status: nuevoEstado === 'revisado' ? 'en_proceso' : nuevoEstado,
      resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null
    };

    this.http.patch(WebServices.ReportUpdate(reporte.id), payload, { headers })
      .subscribe({
        next: () => {
          reporte.status = nuevoEstado as any;
          if (nuevoEstado === 'resuelto') {
            reporte.resolved_at = new Date().toISOString();
          }
          this.success = `Estado actualizado a "${nuevoEstado}".`;
          this.aplicarFiltros();
          this.cdr.detectChanges();
          setTimeout(() => {
            this.success = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          console.error('❌ Error al actualizar estado:', err);
          this.error = err.error?.error || 'Error al actualizar estado.';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.error = '';
            this.cdr.detectChanges();
          }, 3000);
        }
      });
  }

  obtenerClaseEstado(status: string): string {
    const clases: Record<string, string> = {
      pendiente: 'status-pending',
      revisado: 'status-review',
      resuelto: 'status-resolved',
      rechazado: 'status-rejected'
    };
    return clases[status] || '';
  }

  obtenerEtiquetaEstado(status: string): string {
    const etiquetas: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado'
    };
    return etiquetas[status] || status;
  }

  obtenerEtiquetaTipo(entityType: string): string {
    const tipos: Record<string, string> = {
      post: 'Publicación',
      comment: 'Comentario',
      review: 'Reseña',
      service: 'Servicio',
      place: 'Lugar',
      event: 'Evento'
    };
    return tipos[entityType] || entityType;
  }
}
