import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { LugarCardComponent } from '../../components/lugar-card/lugar-card'; // ✅ Importado
import { PlaceService } from '../../../../core/services/place.service';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-lugares-turisticos',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayout, LugarCardComponent], // ✅ Agregado
  templateUrl: './lugares-turisticos.html',
  styleUrls: ['./lugares-turisticos.css']
})
export class LugaresTuristicosPageComponent implements OnInit {

  lugares: any[] = [];
  categorias: any[] = [];
  loading = false;
  error = '';
  filtroCategoria = '';

  constructor(
    private placeService: PlaceService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarLugares();
  }

  cargarCategorias() {
    this.categoryService.listarCategorias('place').subscribe({
      next: (data) => this.categorias = data,
      error: () => {}
    });
  }

  cargarLugares() {
    this.loading = true;
    const filtros: any = {};
    if (this.filtroCategoria) filtros.category = Number(this.filtroCategoria);

    this.placeService.listarLugares(filtros).subscribe({
      next: (data) => {
        this.lugares = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar lugares';
        this.loading = false;
      }
    });
  }
}