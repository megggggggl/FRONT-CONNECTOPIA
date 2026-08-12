// src/app/features/public/pages/denuncias/denunciasForm.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Report } from '../../../../core/models/report.model';

@Component({
  selector: 'app-denuncias-comunitarias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class DenunciasComunitariasComponent implements OnInit {
  // ===== LISTADO DE DENUNCIAS =====
  denuncias: Report[] = [];
  loading = true;
  error = '';
  successMessage = '';
  esAdmin = false;
  
  // ===== FILTROS Y BÚSQUEDA =====
  filtroEstado = 'todas';
  searchTerm = '';
  
  // ===== ESTADÍSTICAS =====
  get pendingCount(): number {
    return this.denuncias.filter(d => d.status === 'pendiente' || d.status === 'en_proceso').length;
  }
  get resolvedCount(): number {
    return this.denuncias.filter(d => d.status === 'resuelto').length;
  }

  // ===== MODAL DE CREACIÓN =====
  modalAbierto = false;
  enviando = false;
  nuevaDenuncia = {
    titulo: '',
    descripcion: '',
    tipo: 'bache' as const,
    prioridad: 'media' as const,
    direccion: '',
    ubicacion: null as { lat: number; lng: number } | null,
    imagen: null as string | null
  };

  tipos = [
    { value: 'bache', label: 'Bache' },
    { value: 'basura', label: 'Basura acumulada' },
    { value: 'alumbrado', label: 'Problema de alumbrado' },
    { value: 'seguridad', label: 'Inseguridad' },
    { value: 'agua', label: 'Problema de agua' },
    { value: 'otros', label: 'Otros' }
  ];

  prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ];

  estadosMap: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    resuelto: 'Resuelto',
    rechazado: 'Rechazado'
  };

  // ===== FILTROS (para el HTML) =====
  filters = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'resuelto', label: 'Resueltas' },
    { value: 'rechazado', label: 'Rechazadas' }
  ];

  get activeFilter(): string {
    return this.filtroEstado;
  }

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.getUserRole() === 'admin';
    this.cargarDenuncias();
  }

  // ============================================================
  // CARGAR DENUNCIAS
  // ============================================================
  cargarDenuncias(): void {
    this.loading = true;
    this.error = '';
    this.reportService.listarDenuncias().subscribe({
      next: (data) => {
        this.denuncias = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar denuncias:', err);
        this.error = 'Error al cargar denuncias.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // FILTROS Y BÚSQUEDA
  // ============================================================
  setFilter(value: string): void {
    this.filtroEstado = value;
  }

  get filteredReports(): Report[] {
    let reports = this.denuncias;
    if (this.filtroEstado !== 'todas') {
      reports = reports.filter(d => d.status === this.filtroEstado);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      reports = reports.filter(d => 
        d.title?.toLowerCase().includes(term) || 
        d.address?.toLowerCase().includes(term)
      );
    }
    return reports;
  }

  // ============================================================
  // MODAL DE CREACIÓN
  // ============================================================
  abrirModal(): void {
    this.modalAbierto = true;
    this.nuevaDenuncia = {
      titulo: '',
      descripcion: '',
      tipo: 'bache',
      prioridad: 'media',
      direccion: '',
      ubicacion: null,
      imagen: null
    };
    this.obtenerUbicacion();
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  obtenerUbicacion(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.nuevaDenuncia.ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        this.cdr.detectChanges();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.nuevaDenuncia.imagen = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  enviarDenuncia(): void {
    if (!this.nuevaDenuncia.titulo.trim() || !this.nuevaDenuncia.descripcion.trim()) {
      alert('Completa el título y la descripción.');
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      alert('Debes iniciar sesión.');
      return;
    }

    this.enviando = true;

    const payload: any = {
      author_id: user.id,
      title: this.nuevaDenuncia.titulo,
      description: this.nuevaDenuncia.descripcion,
      type: this.nuevaDenuncia.tipo,
      priority: this.nuevaDenuncia.prioridad,
      address: this.nuevaDenuncia.direccion || null,
      photo_url: this.nuevaDenuncia.imagen,
      status: 'pendiente' as const
    };

    if (this.nuevaDenuncia.ubicacion) {
      payload.location = {
        type: 'Point',
        coordinates: [this.nuevaDenuncia.ubicacion.lng, this.nuevaDenuncia.ubicacion.lat]
      };
    }

    this.reportService.crearDenuncia(payload).subscribe({
      next: (nueva) => {
        this.enviando = false;
        this.denuncias.unshift(nueva);
        this.cerrarModal();
        this.successMessage = '✅ Denuncia enviada correctamente';
        setTimeout(() => this.successMessage = '', 4000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enviando = false;
        console.error('Error al enviar denuncia:', err);
        this.error = '❌ Error al enviar la denuncia';
        setTimeout(() => this.error = '', 4000);
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // ADMIN: CAMBIAR ESTADO
  // ============================================================
  cambiarEstado(denuncia: Report, nuevoEstado: string): void {
    if (!this.esAdmin) return;
    if (!confirm(`¿Cambiar estado a "${this.estadosMap[nuevoEstado]}"?`)) return;

    this.reportService.actualizarDenuncia(denuncia.id, {
      status: nuevoEstado as any,
      resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null
    }).subscribe({
      next: () => {
        denuncia.status = nuevoEstado as any;
        if (nuevoEstado === 'resuelto') {
          denuncia.resolved_at = new Date().toISOString();
        }
        this.successMessage = '✅ Estado actualizado';
        setTimeout(() => this.successMessage = '', 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = '❌ Error al actualizar estado';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }


  // ============================================================
  // UTILIDADES
  // ============================================================
  statusLabel(status: string): string {
    return this.estadosMap[status] || status;
  }

  obtenerClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      pendiente: 'estado-pendiente',
      en_proceso: 'estado-proceso',
      resuelto: 'estado-resuelto',
      rechazado: 'estado-rechazado'
    };
    return clases[estado] || '';
  }

  obtenerClasePrioridad(prioridad: string): string {
    const clases: Record<string, string> = {
      baja: 'prioridad-baja',
      media: 'prioridad-media',
      alta: 'prioridad-alta',
      urgente: 'prioridad-urgente'
    };
    return clases[prioridad] || '';
  }

  trackById(index: number, item: Report): string {
    return item.id;
  }

  // ============================================================
  // HANDLER PARA EL FORMULARIO DEL HTML (side panel)
  // ============================================================
  createReport(): void {
    this.enviarDenuncia();
  }

  handleImage(event: Event): void {
    this.seleccionarImagen(event);
  }
}