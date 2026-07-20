// src/app/features/profile/profile.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';

// Componentes del perfil
import { PerfilVecino } from './components/perfil-vecino/perfil-vecino';
import { PerfilPrestador } from './components/perfil-prestador/perfil-prestador';

// Componentes compartidos (si los usas)
import { EncabezadoPerfil } from '../../compartido/componentes/encabezado-perfil/encabezado-perfil';
import { TarjetaEstadistica } from '../../compartido/componentes/tarjeta-estadistica/tarjeta-estadistica';
import { TarjetaServicio } from '../../compartido/componentes/tarjeta-servicio/tarjeta-servicio';

@NgModule({
  
  
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    // Si son standalone, importarlos aquí
    EncabezadoPerfil,
    TarjetaEstadistica,
    TarjetaServicio,
  ],
  exports: []
})
export class ProfileModule { }