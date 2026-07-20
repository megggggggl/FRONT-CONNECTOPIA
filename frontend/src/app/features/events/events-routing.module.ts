// features/events/events-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { EventsListComponent } from './pages/list/events-list';
// import { EventDetailComponent } from './pages/detail/event-detail';

// Por ahora, dejamos las rutas vacías o con un placeholder
const routes: Routes = [
  // { path: '', component: EventsListComponent },
  // { path: ':id', component: EventDetailComponent },
  // Si no tienes componentes aún, puedes redirigir a explorar
  { path: '', redirectTo: '/explorar', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }