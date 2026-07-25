import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class SidebarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  user: any = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private menuService: MenuService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarMenu();
    this.cargarUsuario();
    this.authSubscription = this.authService.authChange$.subscribe(() => {
      this.cargarMenu();
      this.cargarUsuario();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  cargarMenu(): void {
    this.menuItems = this.menuService.getSidebarItems();
  }

  cargarUsuario(): void {
    this.user = this.authService.getUser();
  }

  getIniciales(): string {
    if (!this.user || !this.user.name) return 'U';
    return this.user.name.charAt(0).toUpperCase();
  }

  getRolLabel(): string {
    if (!this.user) return 'Invitado';
    const role = this.user.role || 'turista';
    const map: Record<string, string> = {
      vecino: 'Vecino',
      prestador: 'Prestador',
      admin: 'Administrador',
      turista: 'Turista'
    };
    return map[role] || role;
  }

  logout(): void {
    this.authService.logout();
  }
}