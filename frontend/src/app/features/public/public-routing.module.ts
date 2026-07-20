// features/public/public-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExplorarPageComponent } from './pages/explorar/explorar';
import { MapaPageComponent } from './pages/mapa/mapa';
import { ServiciosPageComponent } from './pages/servicios/servicios';
import { LugaresTuristicosPageComponent } from './pages/lugares-turisticos/lugares-turisticos';
import { TerminosPageComponent } from './pages/terminos/terminos';
import { ContactoPageComponent } from './pages/contacto/contacto';

const routes: Routes = [
  { path: '', component: ExplorarPageComponent },
  { path: 'mapa', component: MapaPageComponent },
  { path: 'servicios', component: ServiciosPageComponent },
  { path: 'servicio/:id', component: ServiciosPageComponent }, // Puede ser un detalle, pero usaremos el mismo por ahora
  { path: 'lugares-turisticos', component: LugaresTuristicosPageComponent },
  { path: 'lugar-turistico/:id', component: LugaresTuristicosPageComponent },
  { path: 'terminos', component: TerminosPageComponent },
  { path: 'contacto', component: ContactoPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }