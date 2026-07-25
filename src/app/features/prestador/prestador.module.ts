import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrestadorRoutingModule } from './prestador-routing.module';
import { AdminLayout } from '../../core/layout/admin-layout/admin-layout';
import { GestionesPageComponent } from './pages/gestiones/gestiones';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PrestadorRoutingModule,
    AdminLayout,
    GestionesPageComponent
  ]
})
export class PrestadorModule { }