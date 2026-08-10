// src/app/features/admin/pages/verifications/verifications.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
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
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayout],
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

  constructor(private http: HttpClient) {}

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
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.get<{ data: SolicitudVerificacion[] }>(WebServices.VerificationPending, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.error = err.error?.error || 'Error al cargar solicitudes.';
          return of({ data: [] });
        }),
        finalize(() => { this.loading = false; })
      )
      .subscribe({
        next: (resp) => {
          this.solicitudes = resp.data || [];
        }
      });
  }

  aprobar(id: string): void {
    if (!confirm('¿Aprobar esta verificación?')) return;
    this.accion(id, WebServices.VerificationApprove);
  }

  rechazar(id: string): void {
    const motivo = prompt('Motivo del rechazo (opcional):');
    if (motivo === null) return; // cancelar
    this.accion(id, WebServices.VerificationReject, { reason: motivo || 'Documentación insuficiente' });
  }

  private accion(id: string, endpoint: (id: string) => string, body?: any): void {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.patch(endpoint(id), body || {}, { headers })
      .subscribe({
        next: () => {
          this.success = 'Verificación actualizada.';
          this.cargarSolicitudes();
        },
        error: (err) => {
          this.error = err.error?.error || 'Error al procesar verificación.';
        }
      });
  }

  abrirFotos(urls: { doc: string | null; selfie: string | null }): void {
    // Abrir un modal simple para ver las fotos
    if (urls.doc) window.open(urls.doc, '_blank');
    if (urls.selfie) window.open(urls.selfie, '_blank');
  }
}