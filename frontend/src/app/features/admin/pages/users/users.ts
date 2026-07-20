// features/admin/pages/users/users.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { AdminLayout } from '../../../../core/layout/admin-layout/admin-layout';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayout],
  templateUrl: './users.html',
  styleUrls: ['./users.css', './modal.css']
})
export class UsersPageComponent {
  searchText = '';
  selectedRole = 'Todos los roles';

  currentPage = 1;
  itemsPerPage = 4;

  users = [
    { photo: 'avatar.png', name: 'Nathalia Perez', email: 'nathalia@example.com', role: 'Administrador', date: '22/06/2026' },
    { photo: 'avatar.png', name: 'María López', email: 'maria@example.com', role: 'Moderador', date: '21/06/2026' },
    { photo: 'avatar.png', name: 'Juan Pérez', email: 'juan@example.com', role: 'Usuario', date: '20/06/2026' },
    { photo: 'avatar.png', name: 'Servicios HN', email: 'servicios@example.com', role: 'Prestador', date: '18/06/2026' },
  ];

  get filteredUsers() {
    const texto = this.searchText.toLowerCase().trim();
    return this.users.filter(user => {
      const coincideTexto =
        user.name.toLowerCase().includes(texto) ||
        user.email.toLowerCase().includes(texto) ||
        user.role.toLowerCase().includes(texto);
      const coincideRol =
        this.selectedRole === 'Todos los roles' ||
        user.role === this.selectedRole;
      return coincideTexto && coincideRol;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  isUserModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: any = null;
  avatarPreview = 'avatar.png';

  openUserModal(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.isUserModalOpen = true;
  }

  openEditUserModal(user: any): void {
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.isUserModalOpen = true;
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.avatarPreview = URL.createObjectURL(file);
  }
}