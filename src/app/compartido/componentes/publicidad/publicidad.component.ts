import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-publicidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicidad.component.html',
  styleUrls: ['./publicidad.component.css']
})
export class PublicidadComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error = '';

  // Datos del formulario de creación
  modalAbierto = false;
  nombre = '';
  contenido = '';
  imagenSeleccionada = '';
  tipoPost: 'anuncio' | 'alerta' | 'evento' | 'general' = 'general';
  isUrgent = false;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private http: HttpClient // ✅ Usamos HttpClient directamente, el interceptor se encarga del token
  ) {}
ngOnInit(): void {
  this.cargarPosts();
}

cargarPosts(): void {
  this.loading = true;
  this.error = '';
  this.postService.listarPosts().subscribe({
    next: (posts) => {
      this.posts = posts;
      this.loading = false;
    },
    error: (err) => {
      this.error = 'Error al cargar publicaciones.';
      this.loading = false;
      console.error(err);
    }
  });
}

  // ============================================================
  // MODAL
  // ============================================================
  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.nombre = '';
    this.contenido = '';
    this.imagenSeleccionada = '';
    this.isUrgent = false;
    this.tipoPost = 'general';
  }

  // ============================================================
  // SELECCIONAR IMAGEN (convertir a base64)
  // ============================================================
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

  // ============================================================
  // CREAR PUBLICACIÓN (ENVÍA JSON, NO FORMDATA)
  // ============================================================
  crearPublicacion(): void {
    const user = this.authService.getUser();
    if (!user) {
      alert('Debes iniciar sesión para publicar');
      return;
    }

    const contenido = this.contenido.trim();
    if (!contenido) {
      alert('El contenido es obligatorio');
      return;
    }

    // 🔥 CONSTRUIR PAYLOAD (JSON, no FormData)
    const nuevoPost: Partial<Post> = {
      author_id: user.id,
      title: this.nombre.trim() || contenido.substring(0, 50),
      content: contenido,
      type: this.tipoPost,
      is_urgent: this.isUrgent,
      images: this.imagenSeleccionada ? [this.imagenSeleccionada] : [],
      status: 'active'
    };

    console.log('📤 Enviando POST a:', '/api/posts');
    console.log('📦 Payload:', nuevoPost);

    // ✅ El interceptor agregará el token automáticamente
    this.http.post<Post>('/api/posts', nuevoPost).subscribe({
      next: (post) => {
        this.posts.unshift(post);
        this.cerrarModal();
        alert('✅ Publicación creada exitosamente');
      },
      error: (err) => {
        console.error('❌ Error al crear publicación:', err);
        alert('❌ Error al crear publicación: ' + (err.error?.error || err.message));
      }
    });
  }
}