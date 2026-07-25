// core/services/report.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiServicio) {}

  listarDenuncias(filtros?: { status?: string; priority?: string }) {
    let url = '/reports';
    if (filtros) {
      const params = new URLSearchParams();
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.priority) params.set('priority', filtros.priority);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    return this.api.get<any[]>(url).pipe(timeout(8000));
  }

  obtenerDenuncia(id: string) {
    return this.api.get<any>(`/reports/${id}`).pipe(timeout(8000));
  }

  crearDenuncia(data: any) {
    return this.api.post<any>('/reports', data).pipe(timeout(8000));
  }

  actualizarDenuncia(id: string, data: any) {
    return this.api.patch<any>(`/reports/${id}`, data).pipe(timeout(8000));
  }

  eliminarDenuncia(id: string) {
    return this.api.delete<any>(`/reports/${id}`).pipe(timeout(8000));
  }

  cambiarEstado(id: string, status: string, resolutionNotes?: string) {
    return this.api.patch<any>(`/reports/${id}/status`, { status, resolution_notes: resolutionNotes }).pipe(timeout(8000));
  }

  asignarAdmin(id: string, adminId: string) {
    return this.api.patch<any>(`/reports/${id}/assign`, { assigned_to: adminId }).pipe(timeout(8000));
  }

  agregarComentarioPublico(id: string, comment: string) {
    return this.api.post<any>(`/reports/${id}/comment`, { public_comment: comment }).pipe(timeout(8000));
  }

  denunciasCercanas(lat: number, lng: number, radius: number = 5000) {
    return this.api.get<any[]>(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`).pipe(timeout(8000));
  }
}