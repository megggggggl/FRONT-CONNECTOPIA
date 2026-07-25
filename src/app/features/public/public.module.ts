import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from '../../core/layout/main-layout/main-layout';
import { ExplorarPageComponent } from './pages/explorar/explorar';
import { ServiciosPageComponent } from './pages/servicios/servicios';
import { LugaresTuristicosPageComponent } from './pages/lugares-turisticos/lugares-turisticos';
import { MapaPageComponent } from './pages/mapa/mapa';
import { ContactoPageComponent } from './pages/contacto/contacto';
import { TerminosPageComponent } from './pages/terminos/terminos';

const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'explorar', component: ExplorarPageComponent },
      { path: 'mapa', component: MapaPageComponent },
      { path: 'servicios', component: ServiciosPageComponent },
      { path: 'lugares-turisticos', component: LugaresTuristicosPageComponent },
      { path: 'contacto', component: ContactoPageComponent },
      { path: 'terminos', component: TerminosPageComponent },
      { path: '', redirectTo: 'explorar', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PublicModule { }