import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicPageComponent } from './pages/public/public';

const routes: Routes = [
  { path: '', component: PublicPageComponent },
  { path: 'feed', component: PublicPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VecinoRoutingModule { }