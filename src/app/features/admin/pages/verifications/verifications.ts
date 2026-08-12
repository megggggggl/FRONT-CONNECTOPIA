<<<<<<< HEAD
// src/app/features/admin/pages/verifications/verifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
=======
// src/app/features/admin/pages/verifications/verifications.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
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
<<<<<<< HEAD
  mostrarModalRechazo = false;
  solicitudActual: SolicitudVerificacion | null = null;

  // Para ver fotos en modal
  fotoDocumento: string | null = null;
  fotoSelfie: string | null = null;
  modalFotosAbierto = false;
=======
  private readonly isBrowser: boolean;
  private readonly refreshIntervalMs = 5000;
  private refreshIntervalId: number | null = null;
  private requestInProgress = false;
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44

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

<<<<<<< HEAD
  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
=======
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
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44

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

<<<<<<< HEAD
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
=======
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
          // Este endpoint ya devuelve exclusivamente solicitudes pendientes.
          // Sus elementos no incluyen id_verification_status, por lo que
          // volver a filtrarlos por ese campo vaciaba incorrectamente la lista.
          const pendientes = perfiles;
          const idsActuales = new Set(this.solicitudes.map((solicitud) => solicitud.id));
          const nuevas = pendientes.filter((solicitud) => !idsActuales.has(solicitud.id));
          this.solicitudes = pendientes;

          if (!mostrarCarga && nuevas.length > 0) {
            this.feedback.info(
              nuevas.length === 1
                ? 'Hay una nueva solicitud de verificaciÃ³n.'
                : `Hay ${nuevas.length} nuevas solicitudes de verificaciÃ³n.`
            );
          }
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
        }
      });
  }

<<<<<<< HEAD
  // ============================================================
  // APROBAR
  // ============================================================
  aprobar(solicitud: SolicitudVerificacion): void {
    if (!confirm(`¿Aprobar la verificación de ${solicitud.name}?`)) return;

=======
  private iniciarActualizacionAutomatica(): void {
    if (!this.isBrowser || this.refreshIntervalId !== null) return;

    this.refreshIntervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      this.cargarSolicitudes(false);
    }, this.refreshIntervalMs);
  }

  async aprobar(id: string): Promise<void> {
    if (!await this.feedback.confirm('¿Aprobar esta verificación?', { title: 'Aprobar identidad', confirmText: 'Aprobar' })) return;
    this.accion(id, true);
  }

  async rechazar(id: string): Promise<void> {
    const motivo = await this.feedback.prompt('Indicá por qué se rechaza esta verificación.', { title: 'Rechazar identidad', inputLabel: 'Motivo', confirmText: 'Rechazar', danger: true });
    if (motivo === null) return; // cancelar
    this.accion(id, false, motivo || 'Documentación insuficiente');
  }

  private accion(id: string, approved: boolean, notes?: string): void {
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

<<<<<<< HEAD
    this.http.patch(WebServices.VerificationApprove(solicitud.id), {}, { headers })
=======
    this.http.patch(WebServices.ProfileVerify(id), { approved, notes }, { headers })
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
      .subscribe({
        next: () => {
          this.success = `✅ Verificación de ${solicitud.name} aprobada.`;
          this.cargarSolicitudes();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
<<<<<<< HEAD
          this.error = err.error?.error || 'Error al aprobar verificación.';
          setTimeout(() => this.error = '', 3000);
=======
          this.error = err.error?.error || 'Error al procesar verificación.';
          this.cdr.detectChanges();
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
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
