import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { Favorite } from '../../../../core/models/favorite.model';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-mis-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule, MainLayout],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.css']
})
export class MisFavoritosComponent implements OnInit {
  favoritos: Favorite[] = [];
  loading = true;
  error = '';

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.loading = true;
    this.error = '';
    this.favoriteService.listarFavoritos().subscribe({
      next: (data) => {
        this.favoritos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar favoritos.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  eliminarFavorito(id:  string): void {
    if (!confirm('¿Eliminar este favorito?')) return;
    this.favoriteService.eliminarFavorito(id).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(f => f.id !== id);
      },
      error: (err) => console.error(err)
    });
  }
}