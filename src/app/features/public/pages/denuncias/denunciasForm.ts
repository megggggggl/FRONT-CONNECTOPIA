import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Report } from '../../../../core/models/report.model';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-denuncias-comunitarias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './denunciasF.html',
  styleUrls: ['./denunciasF.css']
})
export class DenunciasComunitariasComponent implements OnInit {
  denuncias: Report[] = [];
  loading = true;
  error = '';
  esAdmin = false;
  filtroEstado = 'todas';

  // Modal de creación
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

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.authService.getUserRole() === 'admin';
    this.cargarDenuncias();
  }

  cargarDenuncias(): void {
    this.loading = true;
    this.error = '';
    this.reportService.listarDenuncias().subscribe({
      next: (denuncias) => {
        this.denuncias = denuncias;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las denuncias';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get denunciasFiltradas(): Report[] {
    if (this.filtroEstado === 'todas') return this.denuncias;
    return this.denuncias.filter(d => d.status === this.filtroEstado);
  }

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
    };
    reader.readAsDataURL(file);
  }

  enviarDenuncia(): void {
    const { titulo, descripcion, tipo, prioridad, direccion, ubicacion, imagen } = this.nuevaDenuncia;
    if (!titulo.trim() || !descripcion.trim()) {
      this.feedback.info('Completa el título y la descripción.');
      return;
    }

    const user = this.authService.getUser();
    if (!user || !this.authService.isAuthenticated() || !localStorage.getItem('access_token')) {
      this.feedback.info('Debes iniciar sesión.');
      return;
    }

    this.enviando = true;

    const payload: any = {
      author_id: user.id,
      title: titulo,
      description: descripcion,
      type: tipo,
      priority: prioridad,
      address: direccion || null,
      photo_url: imagen,
      status: 'pendiente'
    };

    if (ubicacion) {
      payload.location = {
        type: 'Point',
        coordinates: [ubicacion.lng, ubicacion.lat]
      };
    }

    this.reportService.crearDenuncia(payload).subscribe({
      next: (nueva) => {
        this.enviando = false;
        this.denuncias = [nueva, ...this.denuncias];
        this.cerrarModal();
        this.feedback.success('Denuncia enviada y guardada correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enviando = false;
        console.error(err);
        const mensaje = err?.error?.error || err?.error?.message || err?.message || 'No se pudo guardar la denuncia.';
        this.feedback.error(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(denuncia: Report, nuevoEstado: string): void {
    if (!this.esAdmin) return;
    if (!confirm(`¿Cambiar estado a "${this.estadosMap[nuevoEstado]}"?`)) return;

    this.reportService.actualizarDenuncia(denuncia.id, {
      status: nuevoEstado as any,
      resolved_at: nuevoEstado === 'resuelto' ? new Date().toISOString() : null
    }).subscribe({
      next: () => {
        denuncia.status = nuevoEstado as any;
        if (nuevoEstado === 'resuelto') denuncia.resolved_at = new Date().toISOString();
        alert('✅ Estado actualizado');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al actualizar estado');
      }
    });
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
}
