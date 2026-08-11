// src/app/features/admin/pages/verifications/verifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebServices } from '../../../../core/services/webServices';

interface SolicitudVerificacion {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  id_document_type: string | null;
  id_document_number: string | null;
  id_document_photo_url: string | null;
  id_selfie_photo_url: string | null;
  id_verification_attempts: number;
  id_verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verifications.html',
  styleUrls: ['./verifications.css']
})
export class VerificationsPageComponent implements OnInit {
  solicitudes: SolicitudVerificacion[] = [];
  loading = false;
  error = '';
  success = '';
  selectedId: string | null = null;
  motivoRechazo = '';
  mostrarModalRechazo = false;
  solicitudActual: SolicitudVerificacion | null = null;

  // Para ver fotos en modal
  fotoDocumento: string | null = null;
  fotoSelfie: string | null = null;
  modalFotosAbierto = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

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

    this.http.get<{ data: SolicitudVerificacion[] }>(WebServices.VerificationPending, { headers })
      .subscribe({
        next: (resp) => {
          this.solicitudes = resp.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar solicitudes:', err);
          this.error = err.error?.error || 'Error al cargar solicitudes de verificación.';
          this.loading = false;
        }
      });
  }

  // ============================================================
  // APROBAR
  // ============================================================
  aprobar(solicitud: SolicitudVerificacion): void {
    if (!confirm(`¿Aprobar la verificación de ${solicitud.name}?`)) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.VerificationApprove(solicitud.id), {}, { headers })
      .subscribe({
        next: () => {
          this.success = `✅ Verificación de ${solicitud.name} aprobada.`;
          this.cargarSolicitudes();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al aprobar verificación.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  // ============================================================
  // RECHAZAR (con motivo)
  // ============================================================
  abrirModalRechazo(solicitud: SolicitudVerificacion): void {
    this.solicitudActual = solicitud;
    this.motivoRechazo = '';
    this.mostrarModalRechazo = true;
  }

  cerrarModalRechazo(): void {
    this.mostrarModalRechazo = false;
    this.solicitudActual = null;
    this.motivoRechazo = '';
  }

  confirmarRechazo(): void {
    if (!this.solicitudActual) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    const payload = {
      reason: this.motivoRechazo.trim() || 'Documentación insuficiente'
    };

    this.http.patch(WebServices.VerificationReject(this.solicitudActual.id), payload, { headers })
      .subscribe({
        next: () => {
          this.success = `❌ Verificación de ${this.solicitudActual!.name} rechazada.`;
          this.cerrarModalRechazo();
          this.cargarSolicitudes();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al rechazar verificación.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  // ============================================================
  // VER FOTOS
  // ============================================================
  verFotos(solicitud: SolicitudVerificacion): void {
    this.fotoDocumento = solicitud.id_document_photo_url;
    this.fotoSelfie = solicitud.id_selfie_photo_url;
    this.modalFotosAbierto = true;
  }

  cerrarModalFotos(): void {
    this.modalFotosAbierto = false;
    this.fotoDocumento = null;
    this.fotoSelfie = null;
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  obtenerTipoDocumento(tipo: string | null): string {
    const tipos: Record<string, string> = {
      dni: 'DNI',
      cedula: 'Cédula',
      pasaporte: 'Pasaporte',
      licencia: 'Licencia de conducir'
    };
    return tipos[tipo || ''] || tipo || 'Documento';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}