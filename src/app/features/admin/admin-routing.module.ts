import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// ✅ Importar con los nombres correctos
import { DashboardPageComponent } from './pages/dashboard/dashboard';
import { CategoriesPageComponent } from './pages/categories/categories';
import { UsersPageComponent } from './pages/users/users';
import { EventsPageComponent } from './pages/events/events';
import { ReportsPageComponent } from './pages/reports/reports';
import { RolesPageComponent } from './pages/roles/roles';
import { TurismoPageComponent } from './pages/turismo/turismo'; // ✅ CORRECTO

const routes: Routes = [
  { path: '', component: DashboardPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'categories', component: CategoriesPageComponent },
  { path: 'users', component: UsersPageComponent },
  { path: 'events', component: EventsPageComponent },
  { path: 'reports', component: ReportsPageComponent },
  { path: 'roles', component: RolesPageComponent },
  { path: 'turismo', component: TurismoPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }