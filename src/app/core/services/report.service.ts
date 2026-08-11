import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Report } from '../models/report.model';
import { WebServices } from './webServices';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  listarDenuncias(): Observable<Report[]> {
    return this.http.get<any>(WebServices.ReportsList).pipe(
      map(response => {
        // Si la respuesta tiene una propiedad 'data', usarla; si no, asumir que la respuesta es el array
        if (response && Array.isArray(response)) return response;
        if (response && response.data && Array.isArray(response.data)) return response.data;
        return [];
      })
    );
  }

  crearDenuncia(report: Partial<Report>): Observable<Report> {
    const payload = {
      ...report,
      status: (report.status as 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado') || 'pendiente'
    };
    return this.http.post<Report>(WebServices.ReportsCreate, payload);
  }

  actualizarDenuncia(id: string, data: Partial<Report>): Observable<Report> {
    return this.http.patch<Report>(WebServices.ReportUpdate(id), data);
  }

  eliminarDenuncia(id: string): Observable<void> {
    return this.http.delete<void>(WebServices.ReportDelete(id));
  }
}