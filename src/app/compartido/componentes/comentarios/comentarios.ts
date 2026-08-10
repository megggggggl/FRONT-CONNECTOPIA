// src/app/compartido/componentes/comentarios-modal/comentarios-modal.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { WebServices } from '../../../core/services/webServices';

@Component({
  selector: 'app-comentarios-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.css']
})
export class ComentariosModal implements OnInit {
  @Input() postId!: string;
  @Output() cerrar = new EventEmitter<void>();

  comentarios: any[] = [];
  nuevoComentario = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  cargarComentarios(): void {
    this.cargando = true;
    this.http.get<any>(`${WebServices.CommentsList}?post_id=${this.postId}`).subscribe({
      next: (resp) => {
        this.comentarios = resp?.data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.cargando = false;
      }
    });
  }

  enviarComentario(): void {
    const content = this.nuevoComentario.trim();
    if (!content) return;

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.post(WebServices.CommentsCreate, {
      post_id: this.postId,
      content: content
    }, { headers }).subscribe({
      next: (resp: any) => {
        const nuevo = resp?.data;
        if (nuevo) {
          this.comentarios.push(nuevo);
          this.nuevoComentario = '';
        }
      },
      error: (err) => {
        console.error('Error al enviar comentario:', err);
        alert('No se pudo enviar el comentario');
      }
    });
  }

  eliminarComentario(id: string): void {
    if (!confirm('¿Eliminar este comentario?')) return;
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.delete(`${WebServices.CommentsList}/${id}`, { headers }).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.id !== id);
      },
      error: (err) => {
        console.error('Error al eliminar comentario:', err);
        alert('No se pudo eliminar');
      }
    });
  }
}