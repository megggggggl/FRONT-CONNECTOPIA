import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Report } from '../models/report.model';
import { WebServices } from './webServices';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  listarDenuncias(): Observable<Report[]> {
    return this.http.get<Report[] | { data: Report[] }>(WebServices.ReportsList).pipe(
      map((response) => Array.isArray(response) ? response : response.data ?? [])
    );
  }

  crearDenuncia(report: Partial<Report>): Observable<Report> {
    return this.http.post<Report | { data: Report } | { error: string }>(WebServices.ReportsCreate, report).pipe(
      map((response) => {
        if ('error' in response) throw new Error(response.error);
        const denuncia = 'data' in response ? response.data : response;
        if (!denuncia?.id) throw new Error('El servidor no confirmó que la denuncia fue guardada.');
        return denuncia;
      })
    );
  }

  actualizarDenuncia(id: string, data: Partial<Report>): Observable<Report> {
    return this.http.patch<Report | { data: Report } | { error: string }>(WebServices.ReportUpdate(id), data).pipe(
      map((response) => {
        if ('error' in response) throw new Error(response.error);
        return 'data' in response ? response.data : response;
      })
    );
  }

  eliminarDenuncia(id: string): Observable<void> {
    return this.http.delete<void>(WebServices.ReportDelete(id));
  }
}
