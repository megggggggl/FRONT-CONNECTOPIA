// core/guards/auth.guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/auth']);
    return false;
  }

  // Aquí podrías verificar la validez del token (ej. decodificar JWT y comprobar expiración)
  // Si es inválido, limpiar localStorage y redirigir a auth
  // try { ... } catch { localStorage.removeItem('access_token'); router.navigate(['/auth']); return false; }

  return true;
};