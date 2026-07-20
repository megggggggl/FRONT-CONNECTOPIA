// core/services/content-report.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class ContentReportService {
  constructor(private api: ApiServicio) {}

  listarReportes() {
    return this.api.get<any[]>('/content-reports').pipe(timeout(8000));
  }

  obtenerReporte(id: string) {
    return this.api.get<any>(`/content-reports/${id}`).pipe(timeout(8000));
  }

  crearReporte(data: { entity_type: string; entity_id: string; reason: string; description?: string }) {
    return this.api.post<any>('/content-reports', data).pipe(timeout(8000));
  }

  actualizarReporte(id: string, data: any) {
    return this.api.patch<any>(`/content-reports/${id}`, data).pipe(timeout(8000));
  }

  eliminarReporte(id: string) {
    return this.api.delete<any>(`/content-reports/${id}`).pipe(timeout(8000));
  }
}