import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'bus-stops', pathMatch: 'full' }
  // { path: 'bus-stops', component: BusStopsComponent },
  // { path: 'bus-routes', component: BusRoutesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportationRoutingModule { }