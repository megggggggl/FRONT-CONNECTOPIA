import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { Auth } from './pages/auth/auth';
import { LoginForm } from './components/login-form/login-form';
import { RegisterForm } from './components/register-form/register-form';

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    Auth,         // standalone
    LoginForm,    // standalone
    RegisterForm  // standalone
  ]
})
export class AuthModule { }