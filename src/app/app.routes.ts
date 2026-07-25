import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { rolGuard, vecinoGuard, prestadorGuard, adminGuard } from './core/guards/rol.guard';
import { VerificationForm } from './features/auth/components/verification-form/verification-form';

export const routes: Routes = [
  // ============================================================
  // AUTH (Login/Register) – sin autenticación
  // ============================================================
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [noAuthGuard]
  },

  // ✅ Ruta de verificación (debe ir ANTES de la redirección /auth)
  {
    path: 'auth/verificacion',
    component: VerificationForm,
    canActivate: [noAuthGuard] // Permite acceso sin token (recién registrado)
  },

  // Redirección de /auth a raíz (login/register)
  { path: 'auth', redirectTo: '', pathMatch: 'full' },

  // ============================================================
  // PÚBLICAS (Turista)
  // ============================================================
  {
  path: 'explorar',
  loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
},
  { path: 'mapa', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'servicios', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'servicio/:id', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'lugares-turisticos', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'lugar-turistico/:id', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'terminos', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
  { path: 'contacto', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },

  // ============================================================
  // PERFIL (autenticado)
  // ============================================================
  {
    path: 'perfil',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [authGuard]
  },

  // ============================================================
  // VECINO (autenticado + vecino o admin)
  // ============================================================
  {
    path: 'feed',
    loadChildren: () => import('./features/vecino/vecino.module').then(m => m.VecinoModule),
    canActivate: [vecinoGuard]
  },
  {
    path: 'anuncio/nuevo',
    loadChildren: () => import('./features/vecino/vecino.module').then(m => m.VecinoModule),
    canActivate: [vecinoGuard]
  },
  {
    path: 'alerta/nueva',
    loadChildren: () => import('./features/vecino/vecino.module').then(m => m.VecinoModule),
    canActivate: [vecinoGuard]
  },
  {
    path: 'denuncia/nueva',
    loadChildren: () => import('./features/vecino/vecino.module').then(m => m.VecinoModule),
    canActivate: [vecinoGuard]
  },
  {
    path: 'mis-publicaciones',
    loadChildren: () => import('./features/vecino/vecino.module').then(m => m.VecinoModule),
    canActivate: [vecinoGuard]
  },

  // ============================================================
  // PRESTADOR (autenticado + prestador o admin)
  // ============================================================
  {
    path: 'mis-servicios',
    loadChildren: () => import('./features/prestador/prestador.module').then(m => m.PrestadorModule),
    canActivate: [prestadorGuard]
  },
  {
    path: 'mis-servicios/nuevo',
    loadChildren: () => import('./features/prestador/prestador.module').then(m => m.PrestadorModule),
    canActivate: [prestadorGuard]
  },
  {
    path: 'mis-servicios/editar/:id',
    loadChildren: () => import('./features/prestador/prestador.module').then(m => m.PrestadorModule),
    canActivate: [prestadorGuard]
  },
  {
    path: 'mis-servicios/estadisticas/:id',
    loadChildren: () => import('./features/prestador/prestador.module').then(m => m.PrestadorModule),
    canActivate: [prestadorGuard]
  },

  // ============================================================
  // ADMIN (autenticado + admin)
  // ============================================================
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard]
  },

  // ============================================================
  // 404
  // ============================================================
  { path: '**', redirectTo: 'explorar' }
];