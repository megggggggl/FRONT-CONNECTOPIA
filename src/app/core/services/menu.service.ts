import { Injectable } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private authService: AuthService) {}

  getMenuItems(): MenuItem[] {
    const role = this.authService.getUserRole();
    const allItems: MenuItem[] = [
      // ====== PÚBLICOS (turista) ======
      { id: 'explorar', label: 'Explorar', icon: 'bi-compass', route: '/explorar', roles: ['turista'] },
      { id: 'mapa', label: 'Mapa', icon: 'bi-map', route: '/mapa', roles: ['turista'] },
      { id: 'servicios', label: 'Servicios', icon: 'bi-list-ul', route: '/servicios', roles: ['turista'] },
      { id: 'lugares-turisticos', label: 'Lugares Turísticos', icon: 'bi-pin-map', route: '/lugares-turisticos', roles: ['turista'] },
      { id: 'terminos', label: 'Términos', icon: 'bi-file-text', route: '/terminos', roles: ['turista'] },
      { id: 'contacto', label: 'Contacto', icon: 'bi-envelope', route: '/contacto', roles: ['turista'] },

      // ====== AUTENTICADOS (comunes) ======
      { id: 'explorar-auth', label: 'Explorar', icon: 'bi-compass', route: '/explorar', roles: ['vecino', 'prestador', 'admin'] },
      { id: 'perfil', label: 'Mi Perfil', icon: 'bi-person-circle', route: '/perfil', roles: ['vecino', 'prestador', 'admin'] },

      // ====== VECINO ======
      { id: 'feed', label: 'Feed', icon: 'bi-newspaper', route: '/feed', roles: ['vecino', 'admin'] },
      { id: 'anuncio-nuevo', label: 'Nuevo Anuncio', icon: 'bi-megaphone', route: '/anuncio/nuevo', roles: ['vecino', 'admin'] },
      { id: 'alerta-nueva', label: 'Nueva Alerta', icon: 'bi-exclamation-triangle', route: '/alerta/nueva', roles: ['vecino', 'admin'] },
      { id: 'denuncia-nueva', label: 'Nueva Denuncia', icon: 'bi-flag', route: '/denuncia/nueva', roles: ['vecino', 'admin'] },
      { id: 'mis-publicaciones', label: 'Mis Publicaciones', icon: 'bi-files', route: '/mis-publicaciones', roles: ['vecino', 'admin'] },

      // ====== PRESTADOR ======
      { id: 'mis-servicios', label: 'Mis Servicios', icon: 'bi-briefcase', route: '/mis-servicios', roles: ['prestador', 'admin'] },
      { id: 'servicio-nuevo', label: 'Nuevo Servicio', icon: 'bi-plus-circle', route: '/mis-servicios/nuevo', roles: ['prestador', 'admin'] },

      // ====== ADMIN ======
      { id: 'admin-dashboard', label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard', roles: ['admin'] },
      { id: 'admin-usuarios', label: 'Usuarios', icon: 'bi-people', route: '/admin/usuarios', roles: ['admin'] },
      { id: 'admin-contenido', label: 'Moderación', icon: 'bi-shield-check', route: '/admin/contenido', roles: ['admin'] },
      { id: 'admin-categorias', label: 'Categorías', icon: 'bi-tags', route: '/admin/categorias', roles: ['admin'] },
      { id: 'admin-reportes', label: 'Reportes', icon: 'bi-bar-chart', route: '/admin/reportes', roles: ['admin'] },
      { id: 'admin-configuracion', label: 'Configuración', icon: 'bi-gear', route: '/admin/configuracion', roles: ['admin'] }
    ];

    // Si es turista (sin sesión), mostrar solo los items con roles ['turista'] o sin roles.
    const filtered = allItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });

    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Obtener items para el sidebar (puede ser igual a getMenuItems o tener filtros extra)
  getSidebarItems(): MenuItem[] {
    return this.getMenuItems();
  }
}