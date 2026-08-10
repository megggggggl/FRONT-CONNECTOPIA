import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing.module';
import { MainLayout } from '../../core/layout/main-layout/main-layout';

@NgModule({
  imports: [CommonModule, PublicRoutingModule,MainLayout],
  exports: [PublicRoutingModule]
})
export class PublicModule { }