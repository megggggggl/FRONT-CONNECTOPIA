// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener token
  const token = localStorage.getItem('access_token');

  // Clonar la petición
  let authReq = req;

  // Siempre agregar el header de ngrok
  authReq = req.clone({
    setHeaders: {
      'ngrok-skip-browser-warning': 'true'
    }
  });

  // Si hay token, agregar Authorization
  if (token) {
    authReq = authReq.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('🔑 Interceptor: Token agregado a:', req.url);
  } else {
    console.warn('⚠️ Interceptor: No hay token para:', req.url);
  }

  return next(authReq);
};