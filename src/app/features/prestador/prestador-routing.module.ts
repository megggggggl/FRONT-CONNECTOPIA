import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from '../../core/layout/main-layout/main-layout';
import { Gestiones } from './pages/gestiones/gestiones';
import { prestadorGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [prestadorGuard],
    children: [
      {
        path: '',
        component: Gestiones
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrestadorRoutingModule { }