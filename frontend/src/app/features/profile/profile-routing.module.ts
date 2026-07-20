// src/app/features/profile/profile-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { vecinoGuard, prestadorGuard } from '../../core/guards/rol.guard';
import { PerfilVecino } from './components/perfil-vecino/perfil-vecino';
import { PerfilPrestador } from './components/perfil-prestador/perfil-prestador';

const routes: Routes = [
  {
    path: 'vecino',
    component: PerfilVecino,
    canActivate: [authGuard, vecinoGuard] // Requiere autenticación y rol vecino/admin
  },
  {
    path: 'prestador',
    component: PerfilPrestador,
    canActivate: [authGuard, prestadorGuard] // Requiere autenticación y rol prestador/admin
  },
  {
    path: '',
    redirectTo: 'vecino',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }