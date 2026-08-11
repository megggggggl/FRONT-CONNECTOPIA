import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { vecinoGuard, prestadorGuard, adminGuard } from './core/guards/rol.guard';
import { VerificationForm } from './features/auth/components/verification-form/verification-form';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { EventosPublicosComponent } from './features/events/pages/eventos-publicos/eventos-publicos';

export const routes: Routes = [
  // ============================================================
  // AUTH (Login/Register) – sin autenticación y sin layout
  // ============================================================
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [noAuthGuard]
  },
  {
    path: 'auth/verificacion',
    component: VerificationForm,
    canActivate: [noAuthGuard]
  },
  { path: 'auth', redirectTo: '', pathMatch: 'full' },

  // ============================================================
  // RUTAS CON LAYOUT PRINCIPAL (sidebar)
  // ============================================================
  {
    path: '',
    component: MainLayout,
    children: [
      // ==========================================================
      // PÚBLICAS – dentro del layout
      // ==========================================================
      {
        path: 'explorar',
        loadComponent: () => import('./features/public/pages/explorar/explorar')
          .then(m => m.ExplorarPageComponent)
      },
      {
        path: 'comunidad',
        loadComponent: () => import('./features/public/pages/comunidad/comunidad')
          .then(m => m.ComunidadComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/public/pages/servicios/servicios')
          .then(m => m.ServiciosPageComponent)
      },
      {
        path: 'bus-routes',
        loadComponent: () => import('./features/public/pages/bus/bus')
          .then(m => m.BusRoutesComponent)
      },
      {
        path: 'lugares-turisticos',
        loadComponent: () => import('./features/public/pages/lugares-turisticos/lugares-turisticos')
          .then(m => m.LugaresTuristicosComponent)
      },
      {
        path: 'lugares-turisticos/nuevo',
        loadComponent: () => import('./features/public/pages/lugares-turisticos/nuevo-lugar')
          .then(m => m.NuevoLugarComponent),
        canActivate: [authGuard]
      },
      {
        path: 'lugares-turisticos/:id',
        loadComponent: () => import('./features/public/pages/lugares-turisticos/detalle-lugar')
          .then(m => m.DetalleLugarComponent)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./features/public/pages/mapa/mapa')
          .then(m => m.MapaComponent)
      },

      // ==========================================================
      // EVENTOS
      // ==========================================================
      {
        path: 'eventos',
        children: [
          { path: '', component: EventosPublicosComponent }
        ]
      },

      // ==========================================================
      // PERFIL (autenticado)
      // ==========================================================
      {
        path: 'perfil',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [authGuard]
      },

      // ==========================================================
      // VECINO
      // ==========================================================
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

      // ==========================================================
      // DENUNCIAS COMUNITARIAS
      // ==========================================================
      {
        path: 'denuncias/comunitarias',
        loadComponent: () => import('./features/public/pages/denuncias/denunciasForm')
          .then(m => m.DenunciasComunitariasComponent),
        canActivate: [authGuard]
      },

      // ==========================================================
      // PRESTADOR
      // ==========================================================
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

      // ==========================================================
      // COMUNES PARA AUTENTICADOS
      // ==========================================================
      {
        path: 'mis-favoritos',
        loadComponent: () => import('./features/public/pages/favoritos/favoritos').then(m => m.MisFavoritosComponent),
        canActivate: [authGuard]
      },
      {
        path: 'mis-notificaciones',
        loadComponent: () => import('./features/public/pages/notificaciones/notificaciones').then(m => m.MisNotificacionesComponent),
        canActivate: [authGuard]
      },

      // ==========================================================
      // 👑 ADMIN (dentro del mismo MainLayout)
      // ==========================================================
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/pages/dashboard/dashboard')
              .then(m => m.DashboardPageComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/pages/users/users')
              .then(m => m.UsersPageComponent)
          },
          {
            path: 'categories',
            loadComponent: () => import('./features/admin/pages/categories/categories')
              .then(m => m.CategoriesPageComponent)
          },
          {
            path: 'moderation',
            loadComponent: () => import('./features/admin/pages/moderation/moderation')
              .then(m => m.ModerationPageComponent)
          },
          {
            path: 'verifications',
            loadComponent: () => import('./features/admin/pages/verifications/verifications')
              .then(m => m.VerificationsPageComponent)
          },
          {
            path: 'events',
            loadComponent: () => import('./features/admin/pages/events/events')
              .then(m => m.EventsPageComponent)
          }
        ]
      }
    ]
  },

  // ============================================================
  // 404
  // ============================================================
  { path: '**', redirectTo: 'explorar' }
];