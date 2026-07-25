import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginForm } from '../../components/login-form/login-form';
import { RegisterForm } from '../../components/register-form/register-form';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginForm, RegisterForm],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth {
  isRegisterMode = false;
  isLandingMode = true;

  showLogin(): void {
    this.isRegisterMode = false;
    this.isLandingMode = true;
  }

  showLanding(): void {
    this.isLandingMode = true;
    this.isRegisterMode = false;
  }

  showRegister(): void {
    this.isRegisterMode = true;
    this.isLandingMode = false;
  }
}