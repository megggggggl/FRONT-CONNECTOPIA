import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebServices } from '../../../../core/services/webServices';
import { BrowserQRCodeReader } from '@zxing/browser';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-form.html',
  styleUrls: ['./verification-form.css']
})
export class VerificationForm {
  documentFrontFile: File | null = null;
  documentBackFile: File | null = null;
  selfieFile: File | null = null;

  documentFrontPreview: string | null = null;
  documentBackPreview: string | null = null;
  selfiePreview: string | null = null;

  qrValidado: boolean = false;
  qrCodigo: string | null = null;
  qrMensaje: string = '';
  qrCargando: boolean = false;

  // Permitir ingreso manual como fallback
  numeroManual: string = '';
  usarManual: boolean = false;

  cargando = false;
  error = '';
  exito = '';
  step = 1;

  constructor(private http: HttpClient, private router: Router) {}

  // ============================================================
  // SELECCIÓN DE ARCHIVOS
  // ============================================================
  onDocumentFrontSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentFrontFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.documentFrontPreview = reader.result as string;
      reader.readAsDataURL(this.documentFrontFile);
    }
  }

  onDocumentBackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentBackFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.documentBackPreview = reader.result as string;
      reader.readAsDataURL(this.documentBackFile);
      this.leerQRDelReverso();
    }
  }

  onSelfieSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selfieFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.selfiePreview = reader.result as string;
      reader.readAsDataURL(this.selfieFile);
    }
  }

  // ============================================================
  // LECTURA DE QR CON @zxing/browser
  // ============================================================
  async leerQRDelReverso(): Promise<void> {
    if (!this.documentBackFile) return;

    this.qrCargando = true;
    this.qrValidado = false;
    this.qrMensaje = '';
    this.qrCodigo = null;

    try {
      const reader = new BrowserQRCodeReader();
      const imageUrl = URL.createObjectURL(this.documentBackFile);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);

      if (!result) {
        this.qrMensaje = 'No se detectó ningún código QR.';
        return;
      }

      const qrText = result.getText();
      console.log('📱 QR detectado:', qrText);

      if (this.esQRValido(qrText)) {
        this.qrValidado = true;
        this.qrCodigo = this.extraerCodigoQR(qrText);
        this.qrMensaje = `✅ QR oficial de la RNP detectado. Código: ${this.qrCodigo || 'Identificado'}`;
        console.log('✅ QR válido:', qrText);
      } else {
        this.qrMensaje = '⚠️ El QR detectado no corresponde a la RNP.';
      }

    } catch (error: any) {
      console.error('❌ Error al leer QR:', error);
      this.qrMensaje = 'Error al leer el QR. Asegúrate de que la imagen esté enfocada.';
    } finally {
      this.qrCargando = false;
    }
  }

  // ============================================================
  // VALIDACIÓN DEL QR
  // ============================================================
  private esQRValido(qr: string): boolean {
    const normalized = qr.trim().toLowerCase();
    return (
      normalized.startsWith('www.rnp.hn/valida/') ||
      normalized.startsWith('https://www.rnp.hn/valida/') ||
      normalized.startsWith('http://www.rnp.hn/valida/') ||
      normalized.startsWith('rnp.hn/valida/') ||
      normalized.includes('rnp.hn/valida/')
    );
  }

  private extraerCodigoQR(qr: string): string | null {
    const match = qr.match(/valida\/([A-Za-z0-9]+)/i);
    if (match) return match[1];
    const numMatch = qr.match(/\b(\d{13})\b/);
    return numMatch ? numMatch[1] : null;
  }

  // ============================================================
  // USAR MODO MANUAL
  // ============================================================
  activarManual(): void {
    this.usarManual = true;
  }

  // ============================================================
  // NAVEGACIÓN
  // ============================================================
  siguienteStep(): void {
    if (this.step === 1) {
      if (!this.documentFrontFile || !this.documentBackFile) {
        this.error = 'Debes seleccionar ambas caras del documento.';
        return;
      }

      // Si el QR es válido, continuar
      if (this.qrValidado) {
        this.error = '';
        this.step = 2;
        return;
      }

      // Si no hay QR válido pero el usuario quiere continuar manualmente
      if (this.usarManual && this.numeroManual.length >= 8) {
        this.qrValidado = true;
        this.qrCodigo = this.numeroManual;
        this.qrMensaje = `✅ Número ingresado manualmente: ${this.numeroManual}`;
        this.error = '';
        this.step = 2;
        return;
      }

      // Si no hay QR y no se ingresó manualmente
      if (!this.usarManual) {
        this.error = '⚠️ No se pudo leer el QR. Puedes intentar de nuevo con una imagen más clara o ingresar el número manualmente.';
        // Mostrar opción manual
        this.usarManual = true;
        return;
      } else {
        this.error = 'Ingresa un número de identidad válido (al menos 8 dígitos).';
      }
    }
  }

  // ============================================================
  // ENVÍO
  // ============================================================
 // verification-form.ts - método enviarVerificacion()
// verification-form.ts
// verification-form.ts - método enviarVerificacion()
async enviarVerificacion(): Promise<void> {
  if (!this.selfieFile) {
    this.error = 'Debes tomarte una selfie.';
    return;
  }
  if (!this.documentFrontFile) {
    this.error = 'Debes subir el anverso del documento.';
    return;
  }
  if (!this.documentBackFile) {
    this.error = 'Debes subir el reverso del documento.';
    return;
  }

  this.cargando = true;
  this.error = '';
  this.exito = '';

  const formData = new FormData();
  formData.append('document_front', this.documentFrontFile);
  formData.append('document_back', this.documentBackFile);
  formData.append('selfie', this.selfieFile);

  const email = localStorage.getItem('pending_verification_email') || '';
  formData.append('email', email);

  this.http.post(WebServices.VerificationDocument, formData).subscribe({
    next: (respuesta: any) => {
      this.exito = 'Solicitud enviada. Un administrador revisará tu identidad.';
      this.cargando = false;
      setTimeout(() => {
        localStorage.removeItem('pending_verification_email');
        this.router.navigate(['/auth']);
      }, 2000);
    },
    error: (error: any) => {
      this.cargando = false;
      this.error = error.error?.error || 'Error al verificar.';
      console.error('❌ Error en verificación:', error);
    }
  });
}}
