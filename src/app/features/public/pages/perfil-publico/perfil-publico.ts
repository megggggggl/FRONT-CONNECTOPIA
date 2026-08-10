import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PerfilPublicoService, PerfilPublico } from '../../../../core/services/perfil-publico.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-publico.html',
  styleUrls: ['./perfil-publico.css']
})
export class PerfilPublicoComponent implements OnInit {
  perfil: PerfilPublico | null = null;
  loading = true;
  error = '';
  userId = '';

  constructor(
    private route: ActivatedRoute,
    private perfilService: PerfilPublicoService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.cargarPerfil();
    } else {
      this.error = 'ID de usuario no válido';
      this.loading = false;
    }
  }

  cargarPerfil(): void {
    this.loading = true;
    this.perfilService.obtenerPerfilPublico(this.userId).subscribe({
      next: (data) => {
        this.perfil = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
      }
    });
  }

  esPropietario(): boolean {
    const user = this.authService.getUser();
    return user?.id === this.userId;
  }
}