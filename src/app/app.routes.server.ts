import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'explorar',
    renderMode: RenderMode.Client
  },
  {
    path: 'comunidad',
    renderMode: RenderMode.Client
  },
  {
    path: 'servicios',
    renderMode: RenderMode.Client
  },
  {
    path: 'bus-routes',
    renderMode: RenderMode.Client
  },
  {
    path: 'lugares-turisticos',
    renderMode: RenderMode.Client
  },
  {
    path: 'mapa',
    renderMode: RenderMode.Client
  },
  {
    path: 'eventos',
    renderMode: RenderMode.Client
  },
  {
    path: 'mis-publicaciones',
    renderMode: RenderMode.Client
  },
  {
    path: 'denuncias/comunitarias',
    renderMode: RenderMode.Client
  },
  {
    path: 'perfil/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'lugares-turisticos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'mis-servicios/editar/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'mis-servicios/estadisticas/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
