// src/app/compartido/componentes/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuService } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  user: any = null;
  avatarError = false;
  logoError = false;

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarMenu();

    // 🔄 Suscribirse a cambios de autenticación (login/logout)
    this.authService.authChange$.subscribe(() => {
      this.cargarMenu();
    });
  }

  /**
   * Carga el menú y el usuario actual
   */
  private cargarMenu(): void {
    this.user = this.authService.getUser();
    this.menuItems = this.menuService.getSidebarItems();

    // Inicializar submenús (cerrados por defecto)
    this.menuItems.forEach(item => {
      if (item.children) {
        item.expanded = false;
      }
    });
  }

  /**
   * Obtiene las iniciales del nombre del usuario para el avatar
   */
  getIniciales(): string {
    if (!this.user?.name) return 'U';
    const nombres = this.user.name.split(' ');
    const iniciales = nombres
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return iniciales || 'U';
  }

  /**
   * Abre/cierra un submenú
   */
  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  /**
   * Navega al perfil del usuario
   */
  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  ocultarAvatar(): void {
    this.avatarError = true;
  }

  ocultarLogo(): void {
    this.logoError = true;
  }

  /**
   * Cierra sesión y redirige al login
   */
  logout(): void {
    this.authService.logout();
  }
}
