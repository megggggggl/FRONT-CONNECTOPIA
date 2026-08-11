// src/app/features/admin/pages/verifications/verifications.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class VerificationsPageComponent implements OnInit {
  solicitudes: SolicitudVerificacion[] = [];
  loading = false;
  error = '';
  success = '';
  selectedId: string | null = null;
  motivoRechazo = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'No autenticado.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<any>(WebServices.ProfilesList, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.error = err.error?.error || 'Error al cargar solicitudes.';
          return of({ data: [] });
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => {
          const perfiles: SolicitudVerificacion[] = Array.isArray(resp) ? resp : resp.data ?? [];
          this.solicitudes = perfiles.filter((perfil) => {
            const estado = String(perfil.id_verification_status ?? '').toLowerCase();
            return estado === 'pending' || estado === 'pendiente';
          });
        }
      });
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
