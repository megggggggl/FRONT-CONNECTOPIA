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
      this.error = 'No autenticado.';
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
          const pendientes = perfiles.filter((perfil) => {
            const estado = String(perfil.id_verification_status ?? '').toLowerCase();
            return estado === 'pending' || estado === 'pendiente';
          });
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
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(WebServices.ProfileVerify(id), { approved, notes }, { headers })
      .subscribe({
        next: () => {
          this.success = 'Verificación actualizada.';
          this.cargarSolicitudes();
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al procesar verificación.';
          this.cdr.detectChanges();
        }
      });
  }

  abrirFotos(urls: { doc: string | null; selfie: string | null }): void {
    // Abrir un modal simple para ver las fotos
    if (urls.doc) window.open(urls.doc, '_blank');
    if (urls.selfie) window.open(urls.selfie, '_blank');
  }
}
