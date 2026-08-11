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

  // 🔥 SOLO RUTAS PÚBLICAS (NO incluir /verification)
  private readonly publicRoutes: { url: string; methods?: string[] }[] = [
    { url: '/auth/login', methods: ['POST'] },
    { url: '/auth/register', methods: ['POST'] },
    { url: '/auth/refresh', methods: ['POST'] },
    { url: '/health' },
    { url: '/categories' },
    { url: '/places', methods: ['GET'] }
    // ❌ /verification NO está aquí → requiere token
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

    const isPublic = this.publicRoutes.some(route => {
      const urlMatch = request.url.includes(route.url);
      if (!urlMatch) return false;
      if (!route.methods) return true;
      return route.methods.includes(request.method);
    });

    let authRequest = request.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

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
        if (error.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('usuario');
          this.router.navigate(['/']);
        }
        return throwError(() => error);
      })
    );
  }
}