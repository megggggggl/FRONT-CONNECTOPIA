import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // ✅ SIEMPRE permitir el acceso a las páginas de auth (login/register)
  // Sin redirigir, sin importar si hay token o no.
  return true;
};