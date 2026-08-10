// src/app/features/admin/pages/users/users.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';

interface PerfilUsuario {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  id_verified: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css', './modal.css']
})
export class UsersPageComponent implements OnInit {
  usuarios: PerfilUsuario[] = [];
  usuariosFiltrados: PerfilUsuario[] = [];
  loading = false;
  error = '';
  success = '';
  searchText = '';
  selectedRole = 'Todos los roles';
  currentPage = 1;
  itemsPerPage = 8;
  totalItems = 0;

  // Modal
  modalAbierto = false;
  modalMode: 'create' | 'edit' = 'create';
  usuarioSeleccionado: PerfilUsuario | null = null;
  formUsuario = {
    name: '',
    email: '',
    role: 'vecino',
    phone: '',
    address: '',
    is_active: true
  };
  guardando = false;
  avatarPreview = 'assets/avatar-default.png';

  roles = ['Todos los roles', 'vecino', 'prestador', 'admin', 'turista'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedUsers(): PerfilUsuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const result = this.usuariosFiltrados.slice(start, start + this.itemsPerPage);
    // Filtrar elementos undefined por si acaso
    return result.filter(user => user !== undefined && user !== null);
  }

  // ============================================================
  // CARGAR USUARIOS
  // ============================================================
  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado. Inicia sesión como administrador.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<{ data: PerfilUsuario[]; pagination?: { total: number } }>(WebServices.ProfilesList, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error al cargar usuarios:', error);
          this.error = error.error?.error || 'Error al cargar usuarios.';
          return of({ data: [], pagination: { total: 0 } });
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (resp) => {
          console.log('✅ Usuarios recibidos:', resp);
          this.usuarios = resp.data || [];
          this.totalItems = resp.pagination?.total || this.usuarios.length;
          this.aplicarFiltros();
        }
      });
  }

  // ============================================================
  // FILTROS
  // ============================================================
  aplicarFiltros(): void {
    const texto = this.searchText.toLowerCase().trim();
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchTexto = u.name.toLowerCase().includes(texto) ||
                        u.email.toLowerCase().includes(texto) ||
                        (u.phone?.toLowerCase() || '').includes(texto);
      const matchRol = this.selectedRole === 'Todos los roles' || u.role === this.selectedRole;
      return matchTexto && matchRol;
    });
    this.totalItems = this.usuariosFiltrados.length;
    // Resetear a la primera página si la actual supera el total
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  onSearch(): void {
    this.aplicarFiltros();
  }

  onRoleChange(): void {
    this.aplicarFiltros();
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // ============================================================
  // MODAL DE USUARIO
  // ============================================================
  openUserModal(): void {
    this.modalMode = 'create';
    this.usuarioSeleccionado = null;
    this.formUsuario = {
      name: '',
      email: '',
      role: 'vecino',
      phone: '',
      address: '',
      is_active: true
    };
    this.avatarPreview = 'assets/avatar-default.png';
    this.modalAbierto = true;
  }

  openEditUserModal(user: PerfilUsuario): void {
    this.modalMode = 'edit';
    this.usuarioSeleccionado = user;
    this.formUsuario = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      is_active: user.is_active
    };
    this.avatarPreview = user.avatar_url || 'assets/avatar-default.png';
    this.modalAbierto = true;
  }

  closeUserModal(): void {
    this.modalAbierto = false;
    this.guardando = false;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarUsuario(): void {
    if (!this.formUsuario.name.trim() || !this.formUsuario.email.trim()) {
      this.error = 'Nombre y email son obligatorios.';
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.success = '';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = {
      name: this.formUsuario.name,
      email: this.formUsuario.email,
      role: this.formUsuario.role,
      phone: this.formUsuario.phone || null,
      address: this.formUsuario.address || null,
      is_active: this.formUsuario.is_active
    };

    let request;
    if (this.modalMode === 'create') {
      // Para crear, usamos el endpoint de registro
      request = this.http.post(WebServices.AuthRegister, {
        ...payload,
        password: 'Temp1234!'
      }, { headers });
    } else {
      request = this.http.patch(WebServices.ProfileUpdate(this.usuarioSeleccionado!.id), payload, { headers });
    }

    request.pipe(
      catchError((error: HttpErrorResponse) => {
        this.error = error.error?.error || 'Error al guardar usuario.';
        this.guardando = false;
        return of(null);
      }),
      finalize(() => {
        this.guardando = false;
      })
    )
    .subscribe({
      next: (resp: any) => {
        if (!resp) return;
        this.success = this.modalMode === 'create' ? 'Usuario creado.' : 'Usuario actualizado.';
        this.closeUserModal();
        this.cargarUsuarios();
      }
    });
  }

  // ============================================================
  // ACCIONES RÁPIDAS
  // ============================================================
  cambiarRol(usuario: PerfilUsuario, nuevoRol: string): void {
    if (!confirm(`¿Cambiar rol de ${usuario.name} a ${nuevoRol}?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.ProfileChangeRole(usuario.id), { role: nuevoRol }, { headers })
      .subscribe({
        next: () => {
          usuario.role = nuevoRol;
          this.success = `Rol actualizado a ${nuevoRol}.`;
          this.aplicarFiltros();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al cambiar rol.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  toggleStatus(usuario: PerfilUsuario): void {
    const accion = usuario.is_active ? 'desactivar' : 'activar';
    if (!confirm(`¿${accion} a ${usuario.name}?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.ProfileToggleStatus(usuario.id), { is_active: !usuario.is_active }, { headers })
      .subscribe({
        next: () => {
          usuario.is_active = !usuario.is_active;
          this.success = `Usuario ${usuario.is_active ? 'activado' : 'desactivado'}.`;
          this.aplicarFiltros();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al cambiar estado.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }
  trackById(index: number, user: PerfilUsuario): string {
  return user?.id || index.toString();
}
}