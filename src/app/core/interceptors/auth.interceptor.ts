// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isBrowser: boolean;

  // Definir rutas públicas con método específico
  private readonly publicRoutes: { url: string; methods?: string[] }[] = [
    { url: '/auth/login', methods: ['POST'] },
    { url: '/auth/register', methods: ['POST'] },
    { url: '/auth/refresh', methods: ['POST'] },
    { url: '/health' }, // todos los métodos
    { url: '/categories' }, // todos los métodos
    // 👇 IMPORTANTE: GET a places es público, POST/PATCH/DELETE NO
    { url: '/places', methods: ['GET'] },
    { url: '/verification' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isBrowser) {
      return next.handle(request);
    }

    // Verificar si la ruta es pública (considerando método)
    const isPublic = this.publicRoutes.some(route => {
      const urlMatch = request.url.includes(route.url);
      if (!urlMatch) return false;
      // Si no tiene métodos definidos, todos son públicos
      if (!route.methods) return true;
      // Si tiene métodos, verificar que el método coincida
      return route.methods.includes(request.method);
    });

    // Clonar con headers base
    let authRequest = request.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    // Si NO es pública, agregar el token
    if (!isPublic) {
      const token = localStorage.getItem('access_token');
      if (token) {
        authRequest = authRequest.clone({
          setHeaders: {
            'ngrok-skip-browser-warning': 'true',
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // No cerrar toda la sesión por un 401 aislado de una sección.
        // Algunos endpoints (por ejemplo, estadísticas administrativas) pueden
        // rechazar la petición aunque el login y el token sean correctos. Borrar
        // aquí el token provocaba el bucle Dashboard -> Login.
        // Solo /auth/me es una comprobación explícita de la sesión actual.
        const isSessionValidation = request.url.includes('/auth/me');
        if (error.status === 401 && isSessionValidation) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('usuario');
          localStorage.removeItem('user');
          this.router.navigateByUrl('/', { replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }
}
