import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionesPageComponent } from './pages/gestiones/gestiones';

const routes: Routes = [
  { path: '', component: GestionesPageComponent },
  { path: 'gestiones', component: GestionesPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrestadorRoutingModule { }