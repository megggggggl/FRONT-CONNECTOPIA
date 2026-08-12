import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
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
