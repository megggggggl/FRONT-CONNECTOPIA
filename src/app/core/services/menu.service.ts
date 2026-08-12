// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private authService: AuthService) {}

  getMenuItems(): MenuItem[] {
    const role = this.authService.getUserRole();

    // ============================================================
    // DEFINICIÓN DE TODOS LOS ITEMS DEL MENÚ
    // ============================================================
    const allItems: MenuItem[] = [
      // ==========================================================
      // 🔓 PÚBLICOS (Turista – sin autenticación)
      // ==========================================================
      {
        id: 'explorar',
        label: 'Explorar',
        icon: 'fa-solid fa-compass',
        route: '/explorar',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'servicios',
        label: 'Servicios',
        icon: 'fa-solid fa-people-group',
        route: '/servicios',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'lugares-turisticos',
        label: 'Lugares Turísticos',
        icon: 'fa-solid fa-location-dot',
        route: '/lugares-turisticos',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'bus-routes',
        label: 'Rutas de Buses',
        icon: 'fa-solid fa-bus-simple',
        route: '/bus-routes',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'mapa',
        label: 'Mapa',
        icon: 'fa-solid fa-map',
        route: '/mapa',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'terminos',
        label: 'Términos',
        icon: 'fa-solid fa-file-lines',
        route: '/terminos',
        roles: ['turista']
      },
      {
        id: 'contacto',
        label: 'Contacto',
        icon: 'fa-solid fa-envelope',
        route: '/contacto',
        roles: ['turista']
      },

      // ==========================================================
      // 🔐 AUTENTICADOS (comunes)
      // ==========================================================
      {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: 'fa-solid fa-circle-user',
        route: '/perfil',
        roles: ['vecino', 'prestador']
      },
      {
        id: 'eventos',
        label: 'Eventos',
        icon: 'fa-solid fa-calendar-days',
        route: '/eventos',
        roles: ['vecino', 'prestador', 'admin']
      },
      {
        id: 'comunidad',
        label: 'Comunidad',
        icon: 'fa-solid fa-comments',
        route: '/comunidad',
        roles: ['vecino', 'prestador']
      },
      {
        id: 'mis-publicaciones',
        label: 'Mis Publicaciones',
        icon: 'fa-solid fa-newspaper',
        route: '/mis-publicaciones',
        roles: ['vecino']
      },
      {
        id: 'denuncias',
        label: 'Denuncias',
        icon: 'fa-solid fa-triangle-exclamation',
        route: '/denuncia/nueva',
        roles: ['vecino']
      },
      // ==========================================================
      // 🌐 COMUNIDAD (solo vecinos, prestadores y admin)
      // ==========================================================
      

      // ==========================================================
      // 💼 PRESTADOR (y admin)
      // ==========================================================
      {
        id: 'mis-servicios',
        label: 'Mis Servicios',
        icon: 'fa-solid fa-briefcase',
        route: '/mis-servicios',
        roles: ['prestador']
      },
       { id: 'denuncias', label: 'Denuncias', icon: 'bi-flag', route: '/denuncias/comunitarias', roles: ['prestador', 'admin', 'vecino'] },
      // ==========================================================
      // ⚙️ ADMIN (solo admin)
      // ==========================================================
      {
        id: 'admin',
        label: 'Administración',
        icon: 'fa-solid fa-shield-halved',
        roles: ['admin'],
        children: [
          {
            id: 'admin-dashboard',
            label: 'Dashboard',
            icon: 'fa-solid fa-gauge-high',
            route: '/admin/dashboard'
          },
          {
            id: 'admin-users',
            label: 'Usuarios',
            icon: 'fa-solid fa-users',
            route: '/admin/users'
          },
          {
            id: 'admin-categories',
            label: 'Categorías',
            icon: 'fa-solid fa-tags',
            route: '/admin/categories'
          },
          {
            id: 'admin-moderation',
            label: 'Moderación',
            icon: 'fa-solid fa-shield',
            route: '/admin/moderation'
          },
          {
            id: 'admin-verifications',
            label: 'Verificaciones',
            icon: 'fa-solid fa-circle-check',
            route: '/admin/verifications'
          },
          {
            id: 'admin-events',
            label: 'Eventos',
            icon: 'fa-solid fa-calendar-days',
            route: '/admin/events'
          },
          {
            id: 'admin-reports',
            label: 'Reportes',
            icon: 'fa-solid fa-flag',
            route: '/admin/reports'
          },
          {
            id: 'admin-tourism',
            label: 'Turismo',
            icon: 'fa-solid fa-map-location-dot',
            route: '/admin/turismo'
          }
        ]
      }
    ];

    // ============================================================
    // FILTRADO POR ROL
    // ============================================================
    const filtered = allItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });

    return filtered;
  }

  getSidebarItems(): MenuItem[] {
    return this.getMenuItems();
  }
}
