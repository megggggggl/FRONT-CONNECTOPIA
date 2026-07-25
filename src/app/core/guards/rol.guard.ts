import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // ← Ajusta la ruta

/**
 * Guard genérico: verifica que el usuario tenga uno de los roles permitidos.
 * Uso: data: { roles: ['admin', 'prestador'] }
 */
export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();
  const allowedRoles = route.data['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirigir según el rol del usuario
  const user = authService.getUser();
  if (user) {
    authService.redirigirPorRol(user);
  } else {
    router.navigate(['/']);
  }
  return false;
};

// ============================================================
// GUARDS ESPECÍFICOS (opcionales, pero útiles para rutas simples)
// ============================================================
export const vecinoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();

  if (!user) {
    router.navigate(['/']);
    return false;
  }

  const role = authService.getUserRole();
  if (role === 'vecino' || role === 'admin') {
    return true;
  }

  authService.redirigirPorRol(user);
  return false;
};

export const prestadorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();

  if (!user) {
    router.navigate(['/']);
    return false;
  }

  const role = authService.getUserRole();
  if (role === 'prestador' || role === 'admin') {
    return true;
  }

  authService.redirigirPorRol(user);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  const role = authService.getUserRole();
  if (role === 'admin') {
    return true;
  }

  const user = authService.getUser();
  if (user) {
    authService.redirigirPorRol(user);
  } else {
    router.navigate(['/']);
  }
  return false;
};