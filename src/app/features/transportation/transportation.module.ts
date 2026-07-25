import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransportationRoutingModule } from './transportation-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TransportationRoutingModule
  ]
})
export class TransportationModule { }