import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VecinoRoutingModule } from './vecino-routing.module';
import { PublicPageComponent } from './pages/public/public';

// Layout
import { MainLayout } from '../../core/layout/main-layout/main-layout';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    VecinoRoutingModule,
    PublicPageComponent, // standalone
    MainLayout
  ]
})
export class VecinoModule { }