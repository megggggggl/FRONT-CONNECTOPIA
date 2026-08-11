// src/app/features/auth/components/login-form/login-form.ts
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css']
})
export class LoginForm {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si ya está autenticado, redirigir según su rol
    if (this.isBrowser && this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      if (user) {
        this.authService.redirigirPorRol(user);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.loginForm.value;

    console.log('🔐 Intentando login con:', { email });

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del login recibida:', response);
        this.isLoading = false;

        // 🔥 Guardar sesión (esto almacena token y usuario en localStorage)
        this.authService.guardarSesion(response);
        
        // Verificar que el token se guardó
        const token = this.authService.getToken();
        console.log('🔑 Token guardado:', token ? '✅ Sí' : '❌ No');
        
        const user = this.authService.getUser();
        console.log('👤 Usuario guardado:', user);

        this.successMessage = '¡Bienvenido! Redirigiendo...';
        
        setTimeout(() => {
          // ✅ Redirige según el rol del usuario (debe venir en response.user)
          const usuarioParaRedirigir = response?.user || response?.session?.user || user;
          this.authService.redirigirPorRol(usuarioParaRedirigir);
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.isLoading = false;
        
        // Manejo de errores mejorado
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión con el servidor.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}