import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ReportStatus = 'pendiente' | 'proceso' | 'urgente' | 'resuelta';
type ReportFilter = 'todas' | ReportStatus;

interface CommunityReport {
  id: number;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  image: string;
  status: ReportStatus;
  likes: number;
  comments: string[];
  commentsOpen?: boolean;
  draftComment?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsPageComponent {
  activeFilter: ReportFilter = 'todas';
  searchTerm = '';
  successMessage = '';
  newReport = { title: '', description: '', location: '', image: '' };

  readonly filters: Array<{ value: ReportFilter; label: string }> = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'proceso', label: 'En proceso' },
    { value: 'urgente', label: 'Urgentes' },
    { value: 'resuelta', label: 'Resueltas' }
  ];

  reports: CommunityReport[] = [
    { id: 1, title: 'Alumbrado público dañado', description: 'Lámpara de alumbrado apagada desde hace varios días en la calle principal.', location: 'Col. Villa Nueva, Calle Principal', createdAt: 'Hace 30 min', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=700', status: 'pendiente', likes: 0, comments: [] },
    { id: 2, title: 'Basura acumulada', description: 'Hay acumulación de basura en la esquina del parque.', location: 'Barrio El Centro, 2da Avenida', createdAt: 'Hace 2 horas', image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=700', status: 'proceso', likes: 0, comments: [] },
    { id: 3, title: 'Hueco en la vía', description: 'Gran hueco en la carretera, peligroso para automovilistas.', location: 'Carretera Valle Verde, Km 3', createdAt: 'Hace 5 horas', image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=700', status: 'urgente', likes: 0, comments: [] },
    { id: 4, title: 'Perro callejero agresivo', description: 'Perro agresivo suelto en la zona.', location: 'Colonia San Miguel', createdAt: 'Hace 1 día', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700', status: 'resuelta', likes: 0, comments: [] }
  ];

  get filteredReports(): CommunityReport[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.reports.filter(report => {
      const matchesStatus = this.activeFilter === 'todas' || report.status === this.activeFilter;
      const content = `${report.title} ${report.description} ${report.location}`.toLowerCase();
      return matchesStatus && (!query || content.includes(query));
    });
  }

  get pendingCount(): number {
    return this.reports.filter(report => report.status === 'pendiente' || report.status === 'urgente').length;
  }

  get resolvedCount(): number {
    return this.reports.filter(report => report.status === 'resuelta').length;
  }

  setFilter(filter: ReportFilter): void {
    this.activeFilter = filter;
  }

  like(report: CommunityReport): void {
    report.likes += 1;
  }

  toggleComments(report: CommunityReport): void {
    report.commentsOpen = !report.commentsOpen;
  }

  addComment(report: CommunityReport): void {
    const comment = report.draftComment?.trim();
    if (!comment) return;
    report.comments.unshift(comment);
    report.draftComment = '';
  }

  handleImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.newReport.image = file ? URL.createObjectURL(file) : '';
  }

  createReport(): void {
    const title = this.newReport.title.trim();
    const description = this.newReport.description.trim();
    const location = this.newReport.location.trim();
    if (!title || !description || !location) return;

    this.reports.unshift({
      id: Date.now(), title, description, location,
      createdAt: 'Hace un momento',
      image: this.newReport.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700',
      status: 'pendiente', likes: 0, comments: []
    });
    this.newReport = { title: '', description: '', location: '', image: '' };
    this.activeFilter = 'todas';
    this.successMessage = 'Denuncia creada correctamente.';
    window.setTimeout(() => this.successMessage = '', 2500);
  }

  statusLabel(status: ReportStatus): string {
    return ({ pendiente: 'Pendiente', proceso: 'En proceso', urgente: 'Urgente', resuelta: 'Resuelta' })[status];
  }
}
