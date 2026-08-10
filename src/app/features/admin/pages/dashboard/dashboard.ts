// features/admin/pages/dashboard/dashboard.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, catchError, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { WebServices } from '../../../../core/services/webServices';

const DASHBOARD_CACHE_KEY = 'connectopia.dashboard.stats';
const DASHBOARD_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

interface DashboardStats {
  users?: { total?: number };
  content?: { posts?: number; services?: number; places?: number; events?: number };
  moderation?: { pendingReports?: number; pendingVerifications?: number };
  recentActivity?: any[];
  updatedAt?: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // ← quitar AdminLayout
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  cargando = false;
  actualizando = false;
  error = '';
  fechaActual = new Date();

  private readonly dashboardCacheListener = (event: Event) => {
    const detalle = (event as CustomEvent<DashboardStats>).detail;
    if (detalle) {
      this.stats = this.combinarStats(this.stats, detalle);
    }
  };

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCacheDashboard();
    if (typeof window !== 'undefined') {
      window.addEventListener('connectopia:dashboard-stats-updated', this.dashboardCacheListener);
    }
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('connectopia:dashboard-stats-updated', this.dashboardCacheListener);
    }
  }

  // Getters para las estadísticas
  get usuarios(): number | null {
    return this.stats?.users?.total ?? null;
  }

  get publicaciones(): number | null {
    return this.stats?.content?.posts ?? null;
  }

  get servicios(): number | null {
    return this.stats?.content?.services ?? null;
  }

  get lugares(): number | null {
    return this.stats?.content?.places ?? null;
  }

  get eventos(): number | null {
    return this.stats?.content?.events ?? null;
  }

  get denunciasPendientes(): number | null {
    return this.stats?.moderation?.pendingReports ?? null;
  }

  get verificacionesPendientes(): number | null {
    return this.stats?.moderation?.pendingVerifications ?? null;
  }

  get actividadReciente(): any[] {
    return this.stats?.recentActivity ?? [];
  }

  cargarDashboard(): void {
    this.cargando = this.stats === null;
    this.actualizando = true;
    this.error = '';

    this.http.get<DashboardStats>(WebServices.StatsDashboard, {
      headers: this.crearHeaders()
    }).pipe(
      finalize(() => {
        this.cargando = false;
        this.actualizando = false;
      }),
      catchError((err: unknown) => {
        this.error = this.obtenerMensajeError(err, 'No se pudieron cargar las estadísticas.');
        this.stats = null;
        return of(null);
      })
    ).subscribe((stats) => {
      if (stats) {
        this.stats = {
          ...stats,
          updatedAt: new Date().toISOString()
        };
        this.guardarCacheDashboard(this.stats);
      }
    });
  }

  anchoBarra(valor: number | null): number {
    return valor == null ? 0 : Math.min(100, Math.max(8, valor > 0 ? 100 : 0));
  }

  private cargarCacheDashboard(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!raw) return;
      const cache = JSON.parse(raw) as DashboardStats;
      if (this.esCacheValido(cache)) {
        this.stats = cache;
      }
    } catch {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
    }
  }

  private guardarCacheDashboard(stats: DashboardStats): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(stats));
    } catch {
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
    }
  }

  private esCacheValido(stats: DashboardStats | null): boolean {
    if (!stats || typeof stats !== 'object' || !stats.updatedAt) return false;
    const edad = Date.now() - new Date(stats.updatedAt).getTime();
    if (!Number.isFinite(edad) || edad > DASHBOARD_CACHE_MAX_AGE_MS) return false;
    return (
      stats.users?.total !== undefined ||
      stats.content?.posts !== undefined ||
      stats.content?.services !== undefined ||
      stats.content?.places !== undefined ||
      stats.content?.events !== undefined ||
      stats.moderation?.pendingReports !== undefined ||
      stats.moderation?.pendingVerifications !== undefined ||
      Array.isArray(stats.recentActivity)
    );
  }

  private combinarStats(actual: DashboardStats | null, parcial: DashboardStats): DashboardStats {
    return {
      ...(actual ?? {}),
      ...parcial,
      users: { ...actual?.users, ...parcial.users },
      content: { ...actual?.content, ...parcial.content },
      moderation: { ...actual?.moderation, ...parcial.moderation },
      recentActivity: parcial.recentActivity ?? actual?.recentActivity ?? [],
      updatedAt: parcial.updatedAt ?? new Date().toISOString()
    };
  }

  private crearHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true'
    };
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return new HttpHeaders(headers);
  }

  private obtenerMensajeError(error: unknown, respaldo: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: string; message?: string } | string | null;
      if (typeof body === 'string') return body.trim() || respaldo;
      return body?.error ?? body?.message ?? respaldo;
    }
    return respaldo;
  }
}