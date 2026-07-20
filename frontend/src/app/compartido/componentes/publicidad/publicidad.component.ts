// compartido/componentes/publicidad/publicidad.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Agregar si usas ngIf/ngFor

@Component({
  selector: 'app-publicidad',
  standalone: true,
  imports: [CommonModule], // ✅ Agregado por si usa directivas
  templateUrl: './publicidad.component.html',
  styleUrls: ['./publicidad.component.css']
})
export class PublicidadComponent {
  modalAbierto = false;

  nombre = '';
  contenido = '';
  imagenSeleccionada = '';

  publicaciones = [
    {
      nombre: 'Ruby Martinez',
      tiempo: 'Hace 30 min',
      tipo: 'Anuncio',
      contenido: 'Vendo refrigeradora usada, poco uso. Interesados escribir inbox.',
      imagen: 'assets/img/refri.jpg'
    }
  ];

  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = () => {
      this.imagenSeleccionada = lector.result as string;
    };

    lector.readAsDataURL(archivo);
  }

  crearPublicacion(): void {
    if (this.nombre.trim() === '' || this.contenido.trim() === '') {
      alert('Completa los datos');
      return;
    }

    this.publicaciones.unshift({
      nombre: this.nombre,
      tiempo: 'Ahora mismo',
      tipo: 'Nuevo',
      contenido: this.contenido,
      imagen: this.imagenSeleccionada
    });

    this.nombre = '';
    this.contenido = '';
    this.imagenSeleccionada = '';

    this.cerrarModal();
  }
}