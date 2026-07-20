import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { WebServices } from '../../../../core/services/webServices';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.css']
})
export class RegisterForm {
  showPassword = false;
  showConfirmPassword = false;
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'vecino' | 'prestador' = 'vecino';
  fechaNacimiento = '';
  idDocumentNumber = '';
  phone = '';

  cargando = false;
  error = '';
  exito = '';

  constructor(private http: HttpClient, private router: Router) {}

  register(): void {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    // ⚠️ Payload con SOLO campos que existen en la tabla
    const payload: any = {
      email: this.email.trim().toLowerCase(),
      password: this.password,
      name: this.name.trim(),
      phone: this.phone?.trim() || null,
      role: this.role
    };

    // Solo agregar si el campo existe y tiene valor
    if (this.fechaNacimiento) payload.fecha_nacimiento = this.fechaNacimiento;
    if (this.idDocumentNumber) payload.id_document_number = this.idDocumentNumber;

    console.log('📦 Payload enviado:', payload);

    this.http.post(WebServices.AuthRegister, payload).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.exito = '✅ Cuenta creada. Redirigiendo a verificación...';
        
        localStorage.setItem('pending_verification_email', this.email);

        setTimeout(() => {
          this.router.navigate(['/auth/verificacion']);
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        console.error('❌ Error en registro:', error);
        
        if (error.status === 409) {
          this.error = 'El correo ya está registrado.';
        } else {
          this.error = error.error?.error || 'Error al registrar. Inténtalo de nuevo.';
        }
      }
    });
  }

  volverAlLogin(): void {
    this.router.navigate(['/auth']);
  }
}