 // core/guards/verified.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const verifiedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  const user = authService.getUser();

  if (user && user.id_verified === true) {
    return true;
  }

  // Si no está verificado, redirige al perfil
  router.navigate(['/perfil']);
  return false;
};