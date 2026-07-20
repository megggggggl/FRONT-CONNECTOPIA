import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';

export interface DashboardStats {
  users?: { total?: number };
  content?: { posts?: number; services?: number; places?: number; events?: number };
  moderation?: { pendingReports?: number; pendingVerifications?: number };
  recentActivity?: any[];
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(WebServices.StatsDashboard);
  }
}