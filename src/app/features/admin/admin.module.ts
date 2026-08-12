import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';

// Componentes standalone (todos deben existir y exportar *PageComponent)
import { DashboardPageComponent } from './pages/dashboard/dashboard';
import { CategoriesPageComponent } from './pages/categories/categories';
import { UsersPageComponent } from './pages/users/users';
import { EventsPageComponent } from './pages/events/events';
import { ReportsPageComponent } from './pages/reports/reports';
import { TurismoPageComponent } from './pages/turismo/turismo';
import { MainLayout } from '../../core/layout/main-layout/main-layout';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule,
    MainLayout,
    DashboardPageComponent,
    CategoriesPageComponent,
    UsersPageComponent,
    EventsPageComponent,
    ReportsPageComponent,
    TurismoPageComponent
  ]
})
export class AdminModule { }
