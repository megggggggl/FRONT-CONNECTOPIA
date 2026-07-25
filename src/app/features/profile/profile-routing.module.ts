// src/app/features/profile/profile-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { vecinoGuard, prestadorGuard } from '../../core/guards/rol.guard';
import { PerfilVecino } from './components/perfil-vecino/perfil-vecino';
import { PerfilPrestador } from './components/perfil-prestador/perfil-prestador';
import { MainLayout } from '../../core/layout/main-layout/main-layout';

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'vecino',
        loadComponent: () => import('./components/perfil-vecino/perfil-vecino').then(m => m.PerfilVecino),
        canActivate: [vecinoGuard]
      },
      {
        path: 'prestador',
        loadComponent: () => import('./components/perfil-prestador/perfil-prestador').then(m => m.PerfilPrestador),
        canActivate: [prestadorGuard]
      },
      { path: '', redirectTo: 'vecino', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }