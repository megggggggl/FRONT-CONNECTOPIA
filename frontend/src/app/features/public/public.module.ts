import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicRoutingModule } from './public-routing.module';

// ✅ No declarar componentes standalone aquí
// (importarlos directamente en las páginas)

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule
    // No poner ServicioCardPublicComponent ni LugarCardComponent aquí
  ]
})
export class PublicModule { }