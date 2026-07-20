// src/app/features/public/pages/explorar/explorar.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { TarjetaServicio } from '../../../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';
import { LugarCardComponent } from '../../components/lugar-card/lugar-card';
import { ServiceService, Service } from '../../../../core/services/service.service';
import { PlaceService, Place } from '../../../../core/services/place.service';
import { CategoryService, Category } from '../../../../core/services/category.service';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainLayout,
    TarjetaServicio,        // ✅ Componente unificado
    LugarCardComponent
  ],
  templateUrl: './explorar.html',
  styleUrls: ['./explorar.css']
})
export class ExplorarPageComponent implements OnInit {
  servicios: Service[] = [];
  lugares: Place[] = [];
  categorias: Category[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filtroCategoria = '';
  ordenPor = 'reciente';

  // ============================================================
  // GETTERS CON FILTROS
  // ============================================================
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

  get lugaresFiltrados() {
    let result = this.lugares;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l => l.name.toLowerCase().includes(term));
    }
    return result;
  }

  // ============================================================
  // CONSTRUCTOR
  // ============================================================
  constructor(
    private serviceService: ServiceService,
    private placeService: PlaceService,
    private categoryService: CategoryService
  ) {}

  // ============================================================
  // NGONINIT
  // ============================================================
  ngOnInit(): void {
    console.log('🚀 ngOnInit iniciado');
    this.cargarCategorias();
    this.cargarDatos();
  }

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  cargarCategorias() {
    this.categoryService.listarCategorias('service').subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('✅ Categorías cargadas:', data.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
      }
    });
  }

  cargarDatos() {
    this.loading = true;
    this.error = '';
    console.log('🔄 Cargando datos...');

    this.serviceService.listarServicios()
      .subscribe({
        next: (servicios) => {
          this.servicios = servicios;
          console.log('✅ Servicios recibidos:', servicios.length);
          this.cargarLugares();
        },
        error: (err) => {
          console.error('❌ Error al cargar servicios:', err);
          this.error = 'Error al cargar servicios';
          this.loading = false;
        }
      });
  }

  cargarLugares() {
    this.placeService.listarLugares()
      .subscribe({
        next: (lugares) => {
          this.lugares = lugares;
          console.log('✅ Lugares recibidos:', lugares.length);
          this.loading = false;
          console.log('🔄 Carga finalizada, loading =', this.loading);
        },
        error: (err) => {
          console.error('❌ Error al cargar lugares:', err);
          this.error = 'Error al cargar lugares';
          this.loading = false;
        }
      });
  }

  // ============================================================
  // ACCIONES DE USUARIO
  // ============================================================
  onSearch() { /* Los getters se actualizan solos */ }
  onCategoryChange() { /* Los getters se actualizan solos */ }
  onOrderChange() { /* Los getters se actualizan solos */ }

  limpiarFiltros() {
    this.searchTerm = '';
    this.filtroCategoria = '';
    this.ordenPor = 'reciente';
  }

  // ============================================================
  // EVENTO: SOLICITAR CITA (desde TarjetaServicio)
  // ============================================================
  onSolicitarCita(servicio: Service): void {
    console.log('📅 Solicitar cita para:', servicio.name);
    // Aquí puedes redirigir a la página de cita o abrir un modal
    // Ejemplo:
    // this.router.navigate(['/cita', servicio.id]);
    alert(`Solicitar cita para: ${servicio.name}`);
  }
}