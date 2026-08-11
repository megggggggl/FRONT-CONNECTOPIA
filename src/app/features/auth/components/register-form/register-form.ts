// src/app/features/auth/components/register-form/register-form.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  register(): void {
    // Validaciones
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

    // Construir payload
    const payload: any = {
      email: this.email.trim().toLowerCase(),
      password: this.password,
      name: this.name.trim(),
      phone: this.phone?.trim() || null,
      role: this.role
    };

    if (this.fechaNacimiento) payload.fecha_nacimiento = this.fechaNacimiento;
    if (this.idDocumentNumber) payload.id_document_number = this.idDocumentNumber;

    console.log('📦 Payload de registro:', payload);

    // 1. Registrar usuario
    this.http.post(WebServices.AuthRegister, payload).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Registro exitoso:', respuesta);
        this.exito = '✅ Cuenta creada. Iniciando sesión...';

        // 2. Login automático con las mismas credenciales
        this.authService.login(this.email, this.password).subscribe({
          next: (loginResp: any) => {
            console.log('🔐 Login automático exitoso');
            // 3. Guardar sesión
            this.authService.guardarSesion(loginResp);
            this.exito = '✅ Sesión iniciada. Redirigiendo a verificación...';

            // 4. Redirigir a verificación
            setTimeout(() => {
              this.router.navigate(['/auth/verificacion']);
            }, 1500);
          },
          error: (loginError: any) => {
            console.error('❌ Error en login automático:', loginError);
            this.cargando = false;
            this.error = 'Cuenta creada, pero no se pudo iniciar sesión automáticamente. Por favor, inicia sesión manualmente.';
            setTimeout(() => {
              this.router.navigate(['/auth']);
            }, 2000);
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        console.error('❌ Error en registro:', error);
        if (error.status === 409 || error.error?.error?.includes('duplicate')) {
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}