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
        icon: 'bi-compass',
        route: '/explorar',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'servicios',
        label: 'Servicios',
        icon: 'bi-list-ul',
        route: '/servicios',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'lugares-turisticos',
        label: 'Lugares Turísticos',
        icon: 'bi-pin-map',
        route: '/lugares-turisticos',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'bus-routes',
        label: 'Rutas de Buses',
        icon: 'bi-bus-front',
        route: '/bus-routes',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'mapa',
        label: 'Mapa',
        icon: 'bi-map',
        route: '/mapa',
        roles: ['turista', 'vecino', 'prestador', 'admin']
      },
      {
        id: 'terminos',
        label: 'Términos',
        icon: 'bi-file-text',
        route: '/terminos',
        roles: ['turista']
      },
      {
        id: 'contacto',
        label: 'Contacto',
        icon: 'bi-envelope',
        route: '/contacto',
        roles: ['turista']
      },

      // ==========================================================
      // 🔐 AUTENTICADOS (comunes)
      // ==========================================================
      {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: 'bi-person-circle',
        route: '/perfil',
        roles: ['vecino', 'prestador', 'admin']
      },
      {
        id: 'eventos',
        label: 'Eventos',
        icon: 'bi-calendar-event',
        route: '/eventos',
        roles: ['vecino', 'prestador', 'admin']
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
        icon: 'bi-briefcase',
        route: '/mis-servicios',
        roles: ['prestador', 'admin']
      },
       { id: 'denuncias', label: 'Denuncias', icon: 'bi-flag', route: '/denuncias/comunitarias', roles: ['prestador', 'admin', 'vecino'] },
      // ==========================================================
      // ⚙️ ADMIN (solo admin)
      // ==========================================================
      {
        id: 'admin',
        label: 'Administración',
        icon: 'bi-shield-lock',
        roles: ['admin'],
        children: [
          {
            id: 'admin-dashboard',
            label: 'Dashboard',
            icon: 'bi-speedometer2',
            route: '/admin/dashboard'
          },
          {
            id: 'admin-users',
            label: 'Usuarios',
            icon: 'bi-people',
            route: '/admin/users'
          },
          {
            id: 'admin-categories',
            label: 'Categorías',
            icon: 'bi-tags',
            route: '/admin/categories'
          },
          {
            id: 'admin-moderation',
            label: 'Moderación',
            icon: 'bi-shield-check',
            route: '/admin/moderation'
          },
          {
            id: 'admin-verifications',
            label: 'Verificaciones',
            icon: 'bi-check-circle',
            route: '/admin/verifications'
          },
          {
            id: 'admin-events',
            label: 'Eventos',
            icon: 'bi-calendar-event',
            route: '/admin/events'
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