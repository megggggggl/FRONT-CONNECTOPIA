// src/app/compartido/componentes/calificar-servicio-modal/calificar-servicio-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebServices } from '../../../core/services/webServices';

@Component({
  selector: 'app-calificar-servicio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificarServicio.html',
  styleUrls: ['./calificarServicio.css']
})
export class CalificarServicioModal {
  @Input() servicioId!: string;
  @Output() cerrar = new EventEmitter<void>();
  @Output() calificado = new EventEmitter<any>();

  rating = 5;
  comentario = '';
  enviando = false;

  constructor(private http: HttpClient) {}

  enviarResena(): void {
    if (this.enviando || !this.servicioId) return;
    this.enviando = true;

    const payload = {
      service_id: this.servicioId,
      rating: this.rating,
      comment: this.comentario
    };

    this.http.post(WebServices.ReviewsCreate, payload).subscribe({
      next: (resp) => {
        this.enviando = false;
        this.calificado.emit(resp);
        this.cerrar.emit();
        alert('✅ Reseña enviada correctamente');
      },
      error: (err) => {
        this.enviando = false;
        console.error('Error al enviar reseña:', err);
        alert('❌ Error al enviar la reseña');
      }
    });
  }
}