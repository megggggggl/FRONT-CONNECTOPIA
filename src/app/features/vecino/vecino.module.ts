import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VecinoRoutingModule } from './vecino-routing.module';
import { PublicPageComponent } from './pages/public/public';

// Layout
import { AdminLayout } from '../../core/layout/admin-layout/admin-layout';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    VecinoRoutingModule,
    PublicPageComponent, // standalone
    AdminLayout
  ]
})
export class VecinoModule { }