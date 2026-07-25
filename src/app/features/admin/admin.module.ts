import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayout } from '../../core/layout/admin-layout/admin-layout';

// Componentes standalone (todos deben existir y exportar *PageComponent)
import { DashboardPageComponent } from './pages/dashboard/dashboard';
import { CategoriesPageComponent } from './pages/categories/categories';
import { UsersPageComponent } from './pages/users/users';
import { EventsPageComponent } from './pages/events/events';
import { ReportsPageComponent } from './pages/reports/reports';
import { RolesPageComponent } from './pages/roles/roles';
import { TurismoPageComponent } from './pages/turismo/turismo';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule,
    AdminLayout,
    DashboardPageComponent,
    CategoriesPageComponent,
    UsersPageComponent,
    EventsPageComponent,
    ReportsPageComponent,
    RolesPageComponent,
    TurismoPageComponent
  ]
})
export class AdminModule { }