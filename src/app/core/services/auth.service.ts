// src/app/core/services/auth.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { WebServices } from './webServices';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private authChangeSubject = new BehaviorSubject<boolean>(false);
  authChange$ = this.authChangeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ============================================================
  // MÉTODOS DE API
  // ============================================================
  login(email: string, password: string) {
    return this.http.post<any>(WebServices.AuthLogin, { email, password });
  }

  register(name: string, email: string, password: string, role: string) {
    return this.http.post<any>(WebServices.AuthRegister, { name, email, password, role });
  }

  // ============================================================
  // GESTIÓN DE SESIÓN (CORREGIDO PARA SUPABASE)
  // ============================================================
  guardarSesion(respuesta: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('📦 Respuesta completa del login:', respuesta);

    // 🔥 Buscar token en diferentes ubicaciones (adaptado para Supabase)
    const accessToken = 
      respuesta?.session?.access_token ||
      respuesta?.access_token ||
      respuesta?.token ||
      null;

    const refreshToken = 
      respuesta?.session?.refresh_token ||
      respuesta?.refresh_token ||
      null;

    // El usuario puede estar en respuesta.user o en respuesta.session.user
    const usuario = 
      respuesta?.user ||
      respuesta?.session?.user ||
      null;

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      console.log('✅ Token guardado correctamente:', accessToken.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No se encontró token en la respuesta');
      console.warn('🔍 Estructura de la respuesta:', Object.keys(respuesta));
      return;
    }

    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      console.log('✅ USUARIO LOGIN:', usuario);
    } else {
      console.warn('⚠️ No se encontró usuario en la respuesta');
    }

    this.notifyAuthChange();
  }

  // ✅ Método de cierre de sesión
  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('usuario');
    }
    this.notifyAuthChange();
    this.router.navigate(['/']);
  }

  // ✅ Alias para compatibilidad
  logout(): void {
    this.cerrarSesion();
  }

  redirigirPorRol(usuario: any): void {
    const rol = String(
      usuario?.role ??
      usuario?.rol ??
      usuario?.user_role ??
      ''
    ).trim().toLowerCase();

    if (rol === 'prestador' || rol === 'prestador de servicios') {
      this.router.navigate(['/perfil/prestador']);
      return;
    }

    if (rol === 'vecino') {
      this.router.navigate(['/perfil/vecino']);
      return;
    }

    if (rol === 'admin') {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.router.navigate(['/explorar']);
  }

  // ============================================================
  // MÉTODOS AUXILIARES
  // ============================================================
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('access_token');
  }

  getUser(): any | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getUserRole(): string {
    const user = this.getUser();
    if (!user) return 'turista';
    const role = user?.role || user?.rol || user?.user_role || '';
    return String(role).trim().toLowerCase() || 'turista';
  }

  getMe() {
    return this.http.get<any>(WebServices.AuthMe);
  }

  // ============================================================
  // NOTIFICACIÓN DE CAMBIO DE AUTENTICACIÓN
  // ============================================================
  notifyAuthChange(): void {
    this.authChangeSubject.next(true);
  }
}