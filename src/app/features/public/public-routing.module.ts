import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorarPageComponent } from './pages/explorar/explorar';
import { ServiciosPageComponent } from './pages/servicios/servicios';
import { LugaresTuristicosComponent } from './pages/lugares-turisticos/lugares-turisticos';
import { MapaComponent } from './pages/mapa/mapa';
import { ContactoPageComponent } from './pages/contacto/contacto';
import { TerminosPageComponent } from './pages/terminos/terminos';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'explorar', component: ExplorarPageComponent },
     { path: 'servicios', component: ServiciosPageComponent },
      { path: 'lugares-turisticos', component: LugaresTuristicosComponent },
      { path: 'mapa', component: MapaComponent },
      { path: 'contacto', component: ContactoPageComponent },
      { path: 'terminos', component: TerminosPageComponent },
      { path: '', redirectTo: 'explorar', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }