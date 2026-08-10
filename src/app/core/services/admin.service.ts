import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';

export interface DashboardStats {
  usuarios: {
    total: number;
    activos: number;
    inactivos: number;
    por_rol: { role: string; count: number }[];
  };
  contenido: {
    posts: number;
    servicios: number;
    eventos: number;
    lugares: number;
    denuncias: number;
  };
  reportes: {
    total: number;
    pendientes: number;
  };
  verificaciones: {
    pendientes: number;
  };
  actividad: { fecha: string; cantidad: number }[];
  usuarios_recientes: any[];
  posts_recientes: any[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${WebServices.AdminDashboard}/stats`);
  }
}