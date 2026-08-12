import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Gestiones } from './pages/gestiones/gestiones';
import { prestadorGuard } from '../../core/guards/rol.guard';

const routes: Routes = [
  {
    path: '',
<<<<<<< HEAD
   
=======
>>>>>>> 7f1e234e4f14af969eed5735e14e56a6589a8c44
    canActivate: [prestadorGuard],
    component: Gestiones
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrestadorRoutingModule { }
