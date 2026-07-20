import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayout],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class ContactoPageComponent {
  nombre = '';
  email = '';
  mensaje = '';

  enviarMensaje() {
    alert('Mensaje enviado (demo)');
    // Aquí iría la lógica real de envío
    this.nombre = '';
    this.email = '';
    this.mensaje = '';
  }
}