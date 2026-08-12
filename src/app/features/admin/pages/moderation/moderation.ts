// src/app/features/admin/pages/moderation/moderation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
=======
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
import { catchError, finalize, of } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';
import { FeedbackService } from '../../../../core/services/feedback.service';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: { id: string; name: string };
  author_id: string;
  type: string;
  is_urgent: boolean;
  images: string[];
  status: 'active' | 'inactive' | 'archived' | 'pendiente';
  created_at: string;
  updated_at: string;
}

export interface ContentReport {
  id: number;
  reporter_id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  description: string | null;
  status: 'pendiente' | 'revisado' | 'resuelto' | 'rechazado';
  created_at: string;
  resolved_at?: string;
  reporter?: { id: string; name: string; email: string };
  entity?: Post;
}

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderation.html',
  styleUrls: ['./moderation.css']
})
export class ModerationComponent implements OnInit {
  // ============================================================
  // ESTADO
  // ============================================================
  activeTab: 'posts' | 'reports' = 'posts';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

<<<<<<< HEAD
  // ============================================================
  // DATOS
  // ============================================================
  posts: Post[] = [];
  reports: ContentReport[] = [];
  filteredPosts: Post[] = [];
  filteredReports: ContentReport[] = [];

  // ============================================================
  // FILTROS
  // ============================================================
  postFilter = 'pending';
  reportFilter = 'pending';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================
  constructor(private http: HttpClient) {}
=======
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44

  // ============================================================
  // NG ON INIT
  // ============================================================
  ngOnInit(): void {
    this.loadData();
  }

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.activeTab === 'posts') {
      this.loadPosts();
    } else {
      this.loadReports();
    }
  }

  loadPosts(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
<<<<<<< HEAD
      this.errorMessage = 'No autenticado. Inicia sesión como administrador.';
      this.isLoading = false;
=======
      this.error = 'No autenticado. Inicia sesión como administrador.';
      this.loading = false;
      this.cdr.detectChanges();
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    // Usamos el endpoint de posts con filtro de estado
    const url = this.postFilter === 'all' 
      ? WebServices.PostsList 
      : `${WebServices.PostsList}?status=${this.postFilter}`;

<<<<<<< HEAD
    this.http.get<{ data: Post[] }>(url, { headers })
=======
    this.http.get<any>(WebServices.ReportsList, { headers })
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
      .pipe(
        catchError((err) => {
          this.errorMessage = err.error?.error || 'Error al cargar publicaciones.';
          return of({ data: [] });
        }),
<<<<<<< HEAD
        finalize(() => { this.isLoading = false; })
      )
      .subscribe({
        next: (resp) => {
          this.posts = resp.data || [];
          this.filteredPosts = this.posts;
=======
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
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
        }
      });
  }

<<<<<<< HEAD
  loadReports(): void {
=======
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

>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'No autenticado. Inicia sesión como administrador.';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

<<<<<<< HEAD
    const url = this.reportFilter === 'all' 
      ? WebServices.ContentReportsList 
      : `${WebServices.ContentReportsList}?status=${this.reportFilter}`;

    this.http.get<{ data: ContentReport[] }>(url, { headers })
      .pipe(
        catchError((err) => {
          this.errorMessage = err.error?.error || 'Error al cargar denuncias.';
          return of({ data: [] });
        }),
        finalize(() => { this.isLoading = false; })
      )
      .subscribe({
        next: (resp) => {
          this.reports = resp.data || [];
          this.filteredReports = this.reports;
=======
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
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
        }
      });
  }

  // ============================================================
  // CAMBIOS DE FILTRO
  // ============================================================
  onTabChange(tab: 'posts' | 'reports'): void {
    this.activeTab = tab;
    this.loadData();
  }

  onPostFilterChange(): void {
    this.loadPosts();
  }

  onReportFilterChange(): void {
    this.loadReports();
  }

  // ============================================================
  // ACCIONES PARA PUBLICACIONES
  // ============================================================
  approvePost(post: Post): void {
    if (!confirm(`¿Aprobar la publicación "${post.title}"?`)) return;
    this.updatePostStatus(post, 'active');
  }

  rejectPost(post: Post): void {
    if (!confirm(`¿Rechazar la publicación "${post.title}"?`)) return;
    this.updatePostStatus(post, 'archived');
  }

  private updatePostStatus(post: Post, status: 'active' | 'archived'): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.PostUpdate(post.id), { status }, { headers })
      .subscribe({
        next: () => {
          post.status = status;
          this.successMessage = `Publicación ${status === 'active' ? 'aprobada' : 'rechazada'}.`;
          // Remover de la lista si está en pendientes
          if (this.postFilter === 'pending') {
            this.posts = this.posts.filter(p => p.id !== post.id);
            this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
          }
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error al actualizar estado.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  deletePost(post: Post): void {
    if (!confirm(`¿Eliminar permanentemente la publicación "${post.title}"?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.delete(WebServices.PostDelete(post.id), { headers })
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.filteredPosts = this.filteredPosts.filter(p => p.id !== post.id);
          this.successMessage = 'Publicación eliminada.';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error al eliminar publicación.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  // ============================================================
  // ACCIONES PARA DENUNCIAS
  // ============================================================
  resolveReport(report: ContentReport): void {
    if (!confirm(`¿Resolver esta denuncia?`)) return;
    this.updateReportStatus(report, 'resuelto');
  }

  rejectReport(report: ContentReport): void {
    if (!confirm(`¿Rechazar esta denuncia?`)) return;
    this.updateReportStatus(report, 'rechazado');
  }

  private updateReportStatus(report: ContentReport, status: 'resuelto' | 'rechazado'): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.ContentReportUpdate(report.id), { 
      status,
      resolved_at: status === 'resuelto' ? new Date().toISOString() : null
    }, { headers })
      .subscribe({
        next: () => {
          report.status = status;
          this.successMessage = `Denuncia ${status === 'resuelto' ? 'resuelta' : 'rechazada'}.`;
          if (this.reportFilter === 'pending') {
            this.reports = this.reports.filter(r => r.id !== report.id);
            this.filteredReports = this.filteredReports.filter(r => r.id !== report.id);
          }
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Error al actualizar estado.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      archived: 'Archivado',
      pending: 'Pendiente',
      inactive: 'Inactivo'
    };
    return labels[status] || status;
  }

  getReportStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'status-active',
      archived: 'status-archived',
      pending: 'status-pending',
      inactive: 'status-inactive'
    };
    return classes[status] || '';
  }

  getReportStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pendiente: 'status-pending',
      revisado: 'status-review',
      resuelto: 'status-resolved',
      rechazado: 'status-rejected'
    };
    return classes[status] || '';
  }
}
