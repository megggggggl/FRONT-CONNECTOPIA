// features/admin/pages/roles/roles.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { AdminLayout } from '../../../../core/layout/admin-layout/admin-layout';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css', './rolemodal.css', './permisos.css']
})
export class RolesPageComponent {
  isCreateRoleModalOpen = false;
  roleStatusActive = true;

  searchText = '';

  get filteredRoles() {
    const texto = this.searchText.toLowerCase().trim();
    if (!texto) return this.roles;
    return this.roles.filter(role => {
      const nombreRol = role.name.toLowerCase();
      const permisos = role.permissions.join(' ').toLowerCase();
      return nombreRol.includes(texto) || permisos.includes(texto);
    });
  }

  modalMode: 'create' | 'edit' = 'create';
  selectedRole: any = null;

  permissionModules = [
    { name: 'Dashboard', permissions: this.createPermissions() },
    { name: 'Usuarios', permissions: this.createPermissions() },
    { name: 'Publicaciones', permissions: this.createPermissions() },
    { name: 'Servicios', permissions: this.createPermissions() },
    { name: 'Categorías', permissions: this.createPermissions() },
    { name: 'Eventos', permissions: this.createPermissions() },
    { name: 'Anuncios', permissions: this.createPermissions() },
    { name: 'Denuncias', permissions: this.createPermissions() },
    { name: 'Reportes', permissions: this.createPermissions() },
    { name: 'Mensajes', permissions: this.createPermissions() },
    { name: 'Estadísticas', permissions: this.createPermissions() },
    { name: 'Configuración', permissions: this.createPermissions() },
  ];

  roles = [
    {
      name: 'Turista',
      type: 'Sistema',
      description: 'Explora el mapa, turismo y servicios básicos sin registrarse.',
      users: 0,
      status: true,
      permissions: ['Ver mapa', 'Ver turismo', 'Ver servicios'],
    },
    {
      name: 'Vecino',
      type: 'Sistema',
      description: 'Participa en la comunidad, publica, comenta y reporta incidencias.',
      users: 68,
      status: true,
      permissions: ['Crear publicaciones', 'Crear denuncias', 'Ver eventos'],
    },
    {
      name: 'Prestador de servicios',
      type: 'Sistema',
      description: 'Gestiona sus servicios, recibe calificaciones y revisa estadísticas propias.',
      users: 47,
      status: true,
      permissions: ['Crear servicios', 'Editar servicios', 'Ver estadísticas'],
    },
    {
      name: 'Administrador / Moderador',
      type: 'Sistema',
      description: 'Administra usuarios, roles, categorías y modera contenido.',
      users: 3,
      status: true,
      permissions: ['Gestionar usuarios', 'Gestionar roles', 'Moderar contenido'],
    },
  ];

  restrictions = [
    {
      name: 'Puede gestionar roles',
      description: 'Permite crear, editar o eliminar roles.',
      enabled: false,
    },
    {
      name: 'Puede gestionar permisos globales',
      description: 'Permite cambiar permisos de otros roles.',
      enabled: false,
    },
    {
      name: 'Acceso al sistema completo',
      description: 'Otorga todos los permisos sin restricciones.',
      enabled: false,
    },
  ];

  openCreateRoleModal(): void {
    this.modalMode = 'create';
    this.selectedRole = null;
    this.isCreateRoleModalOpen = true;
  }

  openEditRoleModal(role: any): void {
    this.modalMode = 'edit';
    this.selectedRole = role;
    this.isCreateRoleModalOpen = true;
  }

  closeCreateRoleModal(): void {
    this.isCreateRoleModalOpen = false;
  }

  selectAllPermissions(): void {
    this.permissionModules.forEach(module =>
      module.permissions.forEach(permission => permission.enabled = true)
    );
  }

  clearAllPermissions(): void {
    this.permissionModules.forEach(module =>
      module.permissions.forEach(permission => permission.enabled = false)
    );
  }

  toggleRoleStatus(): void {
    this.roleStatusActive = !this.roleStatusActive;
  }

  private createPermissions() {
    return [
      { action: 'view', enabled: false },
      { action: 'create', enabled: false },
      { action: 'edit', enabled: false },
      { action: 'delete', enabled: false },
      { action: 'approve', enabled: false },
    ];
  }
}