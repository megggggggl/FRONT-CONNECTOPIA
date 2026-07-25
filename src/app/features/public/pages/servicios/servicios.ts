import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { TarjetaServicio } from '../../../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';
import { ServiceService, Service } from '../../../../core/services/service.service';
import { CategoryService, Category } from '../../../../core/services/category.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainLayout,
    TarjetaServicio
  ],
  templateUrl: './servicios.html',
  styleUrls: ['./servicios.css']
})
export class ServiciosPageComponent implements OnInit {
  servicios: Service[] = [];
  categorias: Category[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filtroCategoria = '';
  ordenPor = 'reciente';

  get serviciosFiltrados() {
    let result = this.servicios;
    if (this.filtroCategoria) {
      result = result.filter(s => s.category_id === Number(this.filtroCategoria));
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(term));
    }
    if (this.ordenPor === 'nombre') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.ordenPor === 'reciente') {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (this.ordenPor === 'popular') {
      result = [...result].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    }
    return result;
  }

  constructor(
    private serviceService: ServiceService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarServicios();
  }

  cargarCategorias() {
    this.categoryService.listarCategorias('service').subscribe({
      next: (data) => this.categorias = data,
      error: (err) => console.error(err)
    });
  }

  cargarServicios() {
    this.loading = true;
    this.serviceService.listarServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar servicios';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearch() {}
  onCategoryChange() {}
  onOrderChange() {}

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroCategoria = '';
    this.ordenPor = 'reciente';
  }

  onSolicitarCita(servicio: Service): void {
    console.log('Solicitar cita para:', servicio.name);
    // Aquí puedes redirigir o abrir modal
    alert(`Solicitar cita para: ${servicio.name}`);
  }
}