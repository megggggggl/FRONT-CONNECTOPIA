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

  // Rutas públicas (no necesitan token)
  private readonly publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/health',
    '/categories',
    '/services',
    '/places',
    '/verification'
    // '/posts'  // <-- NO incluir /posts aquí (necesita token)
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
    const isPublicRoute = this.publicRoutes.some(route =>
      request.url.includes(route)
    );

    // ✅ Clonar la petición con la cabecera ngrok-skip-browser-warning
    // ✅ NO usar spread en headers
    let authRequest = request.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    // Si NO es pública, agregar el token
    if (!isPublicRoute) {
      const token = localStorage.getItem('access_token');
      if (token) {
        // ✅ Clonar nuevamente, pero ahora con el token
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
        // Si el token expiró (401), redirigir al login
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