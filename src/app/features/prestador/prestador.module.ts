import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestadorRoutingModule } from './prestador-routing.module';
import { Gestiones } from './pages/gestiones/gestiones';

@NgModule({
  imports: [
    CommonModule,
    PrestadorRoutingModule,
    Gestiones // ✅ Si Gestiones es standalone (lo es), debe estar en imports
  ]
})
export class PrestadorModule { }