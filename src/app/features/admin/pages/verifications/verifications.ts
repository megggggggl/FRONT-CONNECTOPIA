// src/app/features/admin/pages/verifications/verifications.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { WebServices } from '../../../../core/services/webServices';
import { FeedbackService } from '../../../../core/services/feedback.service';

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
  id_verification_status?: string | null;
}

@Component({
  selector: 'app-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verifications.html',
  styleUrls: ['./verifications.css']
})
export class VerificationsPageComponent implements OnInit, OnDestroy {
  solicitudes: SolicitudVerificacion[] = [];
  loading = false;
  error = '';
  success = '';
  selectedId: string | null = null;
  motivoRechazo = '';
  // Modales
  mostrarModalRechazo = false;
  solicitudActual: SolicitudVerificacion | null = null;
  modalFotosAbierto = false;
  fotoDocumento: string | null = null;
  fotoSelfie: string | null = null;

  private readonly isBrowser: boolean;
  private readonly refreshIntervalMs = 5000;
  private refreshIntervalId: number | null = null;
  private requestInProgress = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId !== null) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  cargarSolicitudes(mostrarCarga = true): void {
    if (!this.isBrowser || this.requestInProgress) return;

    this.requestInProgress = true;
    if (mostrarCarga) {
      this.loading = true;
      this.error = '';
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado. Inicia sesión como administrador.';
      this.loading = false;
      this.requestInProgress = false;
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<any>(WebServices.VerificationPending, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (mostrarCarga) {
            this.error = err.error?.error || 'Error al cargar solicitudes.';
          }
          return of({ data: mostrarCarga ? [] : this.solicitudes });
        }),
        finalize(() => {
          this.requestInProgress = false;
          if (mostrarCarga) this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => {
          const perfiles: SolicitudVerificacion[] = Array.isArray(resp) ? resp : resp.data ?? [];
          // El endpoint ya devuelve solo pendientes, no filtrar por status
          const pendientes = perfiles;
          const idsActuales = new Set(this.solicitudes.map((s) => s.id));
          const nuevas = pendientes.filter((s) => !idsActuales.has(s.id));
          this.solicitudes = pendientes;

          if (!mostrarCarga && nuevas.length > 0) {
            this.feedback.info(
              nuevas.length === 1
                ? 'Hay una nueva solicitud de verificación.'
                : `Hay ${nuevas.length} nuevas solicitudes de verificación.`
            );
          }
        }
      });
  }

  private iniciarActualizacionAutomatica(): void {
    if (!this.isBrowser || this.refreshIntervalId !== null) return;
    this.refreshIntervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      this.cargarSolicitudes(false);
    }, this.refreshIntervalMs);
  }

  // ============================================================
  // APROBAR / RECHAZAR (con FeedbackService)
  // ============================================================
  async aprobar(id: string): Promise<void> {
    const confirmado = await this.feedback.confirm('¿Aprobar esta verificación?', {
      title: 'Aprobar identidad',
      confirmText: 'Aprobar'
    });
    if (!confirmado) return;
    this.accion(id, true);
  }

  async rechazar(id: string): Promise<void> {
    const motivo = await this.feedback.prompt('Indicá por qué se rechaza esta verificación.', {
      title: 'Rechazar identidad',
      inputLabel: 'Motivo',
      confirmText: 'Rechazar',
      danger: true
    });
    if (motivo === null) return; // canceló
    this.accion(id, false, motivo || 'Documentación insuficiente');
  }

  private accion(id: string, approved: boolean, notes?: string): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.ProfileVerify(id), { approved, notes }, { headers })
      .subscribe({
        next: () => {
          this.success = `✅ ${approved ? 'Aprobada' : 'Rechazada'} verificación.`;
          this.cargarSolicitudes();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al procesar verificación.';
          this.cdr.detectChanges();
        }
      });
  }

  // ============================================================
  // VER FOTOS (modal)
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