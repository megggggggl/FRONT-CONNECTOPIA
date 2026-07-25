// features/events/events.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsRoutingModule } from './events-routing.module'; // <- Importar el routing

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    EventsRoutingModule // <- Agregar aquí
  ]
})
export class EventsModule { }