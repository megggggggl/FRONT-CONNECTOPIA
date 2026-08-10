// src/app/features/profile/profile.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';

// Componentes del perfil
import { PerfilVecino } from './components/perfil-vecino/perfil-vecino';
import { PerfilPrestador } from './components/perfil-prestador/perfil-prestador';

// Componentes compartidos (se usan en los perfiles)
import { EncabezadoPerfil } from '../../compartido/componentes/encabezado-perfil/encabezado-perfil';
import { TarjetaEstadistica } from '../../compartido/componentes/tarjeta-estadistica/tarjeta-estadistica';
import { TarjetaServicio } from '../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';

// Layout principal (si se usa en el routing)
import { MainLayout } from '../../core/layout/main-layout/main-layout';

@NgModule({

  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,


    // Si los componentes compartidos SON standalone, impórtalos aquí
    EncabezadoPerfil,
    TarjetaEstadistica,
    TarjetaServicio
  ],
  exports: [
    // Exportar los componentes si otros módulos los necesitan
    // PerfilVecino,
    // PerfilPrestador
  ]
})
export class ProfileModule { }