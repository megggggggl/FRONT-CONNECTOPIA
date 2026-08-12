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

  // Rutas PÚBLICAS (no requieren token)
  private readonly publicRoutes: { url: string; methods?: string[] }[] = [
    { url: '/auth/login', methods: ['POST'] },
    { url: '/auth/register', methods: ['POST'] },
    { url: '/auth/refresh', methods: ['POST'] },
    { url: '/health' },
    { url: '/categories' },
    { url: '/places', methods: ['GET'] }
    // ❌ /verification NO está aquí → requiere token (el registro hace login automático)
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

    // Verificar si la ruta es pública
    const isPublic = this.publicRoutes.some(route => {
      const urlMatch = request.url.includes(route.url);
      if (!urlMatch) return false;
      if (!route.methods) return true;
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
        console.log('🔑 Interceptor: Token agregado a:', request.url);
      } else {
        console.warn('⚠️ Interceptor: No hay token para:', request.url);
      }
    } else {
      console.log('🌐 Interceptor: Ruta pública, sin token:', request.url);
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('⚠️ Interceptor: 401 detectado, redirigiendo a login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('usuario');
          this.router.navigate(['/']);
        }
        return throwError(() => error);
      })
    );
  }
}