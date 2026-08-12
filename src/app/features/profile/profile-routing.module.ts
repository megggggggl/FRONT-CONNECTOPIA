// src/app/features/profile/profile-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { vecinoGuard, prestadorGuard, profileRedirectGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  {
    path: '',
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
      { path: '', canActivate: [profileRedirectGuard], children: [] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
