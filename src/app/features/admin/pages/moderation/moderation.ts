// src/app/features/admin/pages/moderation/moderation.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  author_id: string;
  status: 'active' | 'inactive' | 'archived';
  is_urgent: boolean;
  created_at: string;
  author?: { name: string; email: string };
}

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

interface DenunciaComunitaria {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  address: string | null;
  photo_url: string | null;
  created_at: string;
  resolved_at: string | null;
  author?: { name: string; email: string };
}

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderation.html',
  styleUrls: ['./moderation.css']
})
export class ModerationPageComponent implements OnInit {
  // ============================================================
  // TABS
  // ============================================================
  tabActivo: 'posts' | 'denuncias' | 'comunitarias' = 'posts';

  // ============================================================
  // PUBLICACIONES (posts)
  // ============================================================
  posts: Post[] = [];
  postsFiltrados: Post[] = [];
  loadingPosts = false;
  errorPosts = '';
  filtroEstadoPosts = 'todos';

  // ============================================================
  // DENUNCIAS DE CONTENIDO (content_reports)
  // ============================================================
  reportes: ReporteContenido[] = [];
  reportesFiltrados: ReporteContenido[] = [];
  loadingReportes = false;
  errorReportes = '';
  filtroEstadoReportes = 'todos';

  // ============================================================
  // DENUNCIAS COMUNITARIAS (reports)
  // ============================================================
  denuncias: DenunciaComunitaria[] = [];
  denunciasFiltradas: DenunciaComunitaria[] = [];
  loadingDenuncias = false;
  errorDenuncias = '';
  filtroEstadoDenuncias = 'todos';

  // ============================================================
  // MENSajes de éxito/error
  // ============================================================
  success = '';
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTodos();
  }

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  cargarTodos(): void {
    if (this.tabActivo === 'posts') this.cargarPosts();
    else if (this.tabActivo === 'denuncias') this.cargarReportes();
    else this.cargarDenunciasComunitarias();
  }

  cambiarTab(tab: 'posts' | 'denuncias' | 'comunitarias'): void {
    this.tabActivo = tab;
    this.error = '';
    this.success = '';
    this.cargarTodos();
  }

  // ============================================================
  // 1. PUBLICACIONES (posts)
  // ============================================================
  cargarPosts(): void {
    this.loadingPosts = true;
    this.errorPosts = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorPosts = 'No autenticado.';
      this.loadingPosts = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<{ data: Post[] }>(WebServices.PostsList, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.errorPosts = err.error?.error || 'Error al cargar publicaciones.';
          return of({ data: [] });
        }),
        finalize(() => { this.loadingPosts = false; })
      )
      .subscribe({
        next: (resp) => {
          this.posts = resp.data || [];
          this.aplicarFiltroPosts();
        }
      });
  }

  aplicarFiltroPosts(): void {
    if (this.filtroEstadoPosts === 'todos') {
      this.postsFiltrados = this.posts;
    } else {
      this.postsFiltrados = this.posts.filter(p => p.status === this.filtroEstadoPosts);
    }
  }

  cambiarEstadoPost(post: Post, nuevoEstado: string): void {
    if (!confirm(`¿Cambiar estado de la publicación a "${nuevoEstado}"?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = { status: nuevoEstado };

    this.http.patch(WebServices.PostUpdate(post.id), payload, { headers })
      .subscribe({
        next: () => {
          post.status = nuevoEstado as any;
          this.success = `Publicación actualizada a "${nuevoEstado}".`;
          this.aplicarFiltroPosts();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al actualizar publicación.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  eliminarPost(post: Post): void {
    if (!confirm(`¿Eliminar permanentemente la publicación "${post.title}"?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.delete(WebServices.PostDelete(post.id), { headers })
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.aplicarFiltroPosts();
          this.success = 'Publicación eliminada.';
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al eliminar publicación.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  // ============================================================
  // 2. DENUNCIAS DE CONTENIDO (content_reports)
  // ============================================================
  cargarReportes(): void {
    this.loadingReportes = true;
    this.errorReportes = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorReportes = 'No autenticado.';
      this.loadingReportes = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<{ data: ReporteContenido[] }>(WebServices.ContentReportsList, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.errorReportes = err.error?.error || 'Error al cargar reportes.';
          return of({ data: [] });
        }),
        finalize(() => { this.loadingReportes = false; })
      )
      .subscribe({
        next: (resp) => {
          this.reportes = resp.data || [];
          this.aplicarFiltroReportes();
        }
      });
  }

  aplicarFiltroReportes(): void {
    if (this.filtroEstadoReportes === 'todos') {
      this.reportesFiltrados = this.reportes;
    } else {
      this.reportesFiltrados = this.reportes.filter(r => r.status === this.filtroEstadoReportes);
    }
  }

  cambiarEstadoReporte(reporte: ReporteContenido, nuevoEstado: string): void {
    if (!confirm(`¿Cambiar estado del reporte a "${nuevoEstado}"?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = { status: nuevoEstado, resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null };

    this.http.patch(WebServices.ContentReportUpdate(reporte.id), payload, { headers })
      .subscribe({
        next: () => {
          reporte.status = nuevoEstado as any;
          if (nuevoEstado === 'resuelto') {
            reporte.resolved_at = new Date().toISOString();
          }
          this.success = `Reporte actualizado a "${nuevoEstado}".`;
          this.aplicarFiltroReportes();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al actualizar reporte.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  // ============================================================
  // 3. DENUNCIAS COMUNITARIAS (reports)
  // ============================================================
  cargarDenunciasComunitarias(): void {
    this.loadingDenuncias = true;
    this.errorDenuncias = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorDenuncias = 'No autenticado.';
      this.loadingDenuncias = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<{ data: DenunciaComunitaria[] }>(WebServices.ReportsList, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.errorDenuncias = err.error?.error || 'Error al cargar denuncias.';
          return of({ data: [] });
        }),
        finalize(() => { this.loadingDenuncias = false; })
      )
      .subscribe({
        next: (resp) => {
          this.denuncias = resp.data || [];
          this.aplicarFiltroDenuncias();
        }
      });
  }

  aplicarFiltroDenuncias(): void {
    if (this.filtroEstadoDenuncias === 'todos') {
      this.denunciasFiltradas = this.denuncias;
    } else {
      this.denunciasFiltradas = this.denuncias.filter(d => d.status === this.filtroEstadoDenuncias);
    }
  }

  cambiarEstadoDenunciaComunitaria(denuncia: DenunciaComunitaria, nuevoEstado: string): void {
    if (!confirm(`¿Cambiar estado de la denuncia a "${nuevoEstado}"?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = {
      status: nuevoEstado,
      resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null
    };

    this.http.patch(WebServices.ReportUpdate(denuncia.id), payload, { headers })
      .subscribe({
        next: () => {
          denuncia.status = nuevoEstado;
          if (nuevoEstado === 'resuelto') {
            denuncia.resolved_at = new Date().toISOString();
          }
          this.success = `Denuncia actualizada a "${nuevoEstado}".`;
          this.aplicarFiltroDenuncias();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al actualizar denuncia.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  obtenerClaseEstado(status: string): string {
    const clases: Record<string, string> = {
      active: 'estado-active',
      inactive: 'estado-inactive',
      archived: 'estado-archived',
      pendiente: 'status-pending',
      revisado: 'status-review',
      resuelto: 'status-resolved',
      rechazado: 'status-rejected',
      en_proceso: 'status-progress'
    };
    return clases[status] || '';
  }

  obtenerEtiquetaEstado(status: string): string {
    const etiquetas: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      archived: 'Archivado',
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado',
      en_proceso: 'En proceso'
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

  obtenerClasePrioridad(prioridad: string): string {
    const clases: Record<string, string> = {
      baja: 'pri-baja',
      media: 'pri-media',
      alta: 'pri-alta',
      urgente: 'pri-urgente'
    };
    return clases[prioridad] || '';
  }

  obtenerEtiquetaPrioridad(prioridad: string): string {
    const etiquetas: Record<string, string> = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta',
      urgente: 'Urgente'
    };
    return etiquetas[prioridad] || prioridad;
  }
}