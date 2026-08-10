// src/app/compartido/componentes/publicidad/publicidad.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post } from '../../../core/models/post.model';
import { WebServices } from '../../../core/services/webServices';

@Component({
  selector: 'app-publicidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicidad.component.html',
  styleUrls: ['./publicidad.component.css']
})
export class PublicidadComponent implements OnInit {
  // 👇 INPUTS PARA FILTROS (desde ComunidadComponent)
  @Input() tipoFiltro?: 'anuncio' | 'alerta' | 'evento' | 'general' | 'empleo' | '';
  @Input() soloUrgentes = false;

  posts: Post[] = [];
  loading = false;
  error = '';
  likesMap: Record<string, { count: number; userLiked: boolean; reactionId?: number }> = {};
  commentsMap: Record<string, any[]> = {};
  showComments: Record<string, boolean> = {};

  // ============================================================
  // FORMULARIO DE PUBLICACIÓN (incluye Empleos)
  // ============================================================
  modalAbierto = false;
  nombre = '';
  contenido = '';
  imagenSeleccionada: string | null = null;
  tipoPost: 'anuncio' | 'alerta' | 'evento' | 'general' | 'empleo' = 'general';
  isUrgent = false;

  // Campos específicos para Empleos
  empleoEmpresa = '';
  empleoSalario = '';
  empleoContacto = '';
  empleoUbicacion = '';
  empleoRequisitos = '';
  empleoJornada: 'tiempo_completo' | 'medio_tiempo' | 'freelance' | 'temporal' = 'tiempo_completo';

  // ============================================================
  // COMENTARIOS
  // ============================================================
  commentText: Record<string, string> = {};
  commentModalAbierto = false;
  currentPostId: string | null = null;

  constructor(
    private postService: PostService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarPosts();
  }

  // ============================================================
  // CARGAR POSTS (CON FILTROS)
  // ============================================================
  cargarPosts(): void {
    this.loading = true;
    this.error = '';
    this.postService.listarPosts().subscribe({
      next: (posts) => {
        let filtrados = posts;
        // Aplicar filtro por tipo si existe
        if (this.tipoFiltro) {
          filtrados = filtrados.filter(p => p.type === this.tipoFiltro);
        }
        // Aplicar filtro de urgentes si está activo
        if (this.soloUrgentes) {
          filtrados = filtrados.filter(p => p.is_urgent === true);
        }
        this.posts = filtrados;
        this.loading = false;
        this.cargarReacciones();
        this.cargarComentarios();
      },
      error: (err) => {
        this.error = 'Error al cargar publicaciones.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // ============================================================
  // REACCIONES (LIKES)
  // ============================================================
  cargarReacciones(): void {
    this.posts.forEach(post => {
      this.http.get<any>(`${WebServices.ReactionsList}?post_id=${post.id}`).subscribe({
        next: (resp) => {
          const reacciones = resp?.data || [];
          const usuario = this.authService.getUser();
          const userId = usuario?.id;
          const userReaction = reacciones.find((r: any) => r.profile_id === userId);
          const likes = reacciones.filter((r: any) => r.reaction_type === 'like');

          this.likesMap[post.id] = {
            count: likes.length,
            userLiked: !!userReaction && userReaction.reaction_type === 'like',
            reactionId: userReaction?.id
          };
        },
        error: () => {
          this.likesMap[post.id] = { count: 0, userLiked: false };
        }
      });
    });
  }

  toggleLike(post: Post): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    const current = this.likesMap[post.id] || { count: 0, userLiked: false };
    const nuevoEstado = !current.userLiked;

    this.likesMap[post.id] = {
      count: nuevoEstado ? current.count + 1 : current.count - 1,
      userLiked: nuevoEstado,
      reactionId: current.reactionId
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'ngrok-skip-browser-warning': 'true'
    });

    if (nuevoEstado) {
      this.http.post(WebServices.ReactionsCreate, {
        post_id: post.id,
        reaction_type: 'like'
      }, { headers }).subscribe({
        next: (resp: any) => {
          const reaction = resp?.data;
          if (reaction) {
            this.likesMap[post.id].reactionId = reaction.id;
          }
        },
        error: (err) => {
          console.error('Error al dar like:', err);
          this.likesMap[post.id] = {
            count: current.count,
            userLiked: current.userLiked,
            reactionId: current.reactionId
          };
          alert('No se pudo dar like');
        }
      });
    } else {
      const reactionId = current.reactionId;
      if (!reactionId) {
        this.cargarReacciones();
        return;
      }
      this.http.delete(`${WebServices.ReactionsList}/${reactionId}`, { headers }).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error al quitar like:', err);
          this.likesMap[post.id] = {
            count: current.count,
            userLiked: current.userLiked,
            reactionId: current.reactionId
          };
          alert('No se pudo quitar el like');
        }
      });
    }
  }

  // ============================================================
  // COMENTARIOS
  // ============================================================
  cargarComentarios(): void {
    this.posts.forEach(post => {
      this.http.get<any>(`${WebServices.CommentsList}?post_id=${post.id}`).subscribe({
        next: (resp) => {
          this.commentsMap[post.id] = resp?.data || [];
        },
        error: () => {
          this.commentsMap[post.id] = [];
        }
      });
    });
  }

  abrirComentarios(post: Post): void {
    this.currentPostId = post.id;
    this.showComments[post.id] = !this.showComments[post.id];
    if (this.showComments[post.id]) {
      this.http.get<any>(`${WebServices.CommentsList}?post_id=${post.id}`).subscribe({
        next: (resp) => {
          this.commentsMap[post.id] = resp?.data || [];
        },
        error: () => {
          this.commentsMap[post.id] = [];
        }
      });
    }
  }

  enviarComentario(postId: string): void {
    if (!this.authService.isAuthenticated()) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    const content = this.commentText[postId]?.trim();
    if (!content) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.post(WebServices.CommentsCreate, {
      post_id: postId,
      content: content
    }, { headers }).subscribe({
      next: (resp: any) => {
        const newComment = resp?.data;
        if (newComment) {
          if (!this.commentsMap[postId]) {
            this.commentsMap[postId] = [];
          }
          this.commentsMap[postId].push(newComment);
          this.commentText[postId] = '';
        }
      },
      error: (err) => {
        console.error('Error al enviar comentario:', err);
        alert('No se pudo enviar el comentario');
      }
    });
  }

  eliminarComentario(commentId: string, postId: string): void {
    if (!confirm('¿Eliminar este comentario?')) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'ngrok-skip-browser-warning': 'true'
    });

    this.http.delete(`${WebServices.CommentsList}/${commentId}`, { headers }).subscribe({
      next: () => {
        this.commentsMap[postId] = this.commentsMap[postId]?.filter(c => c.id !== commentId) || [];
      },
      error: (err) => {
        console.error('Error al eliminar comentario:', err);
        alert('No se pudo eliminar el comentario');
      }
    });
  }

  // ============================================================
  // MODAL DE PUBLICACIÓN (CON EMPLEOS)
  // ============================================================
  abrirModal(): void {
    this.modalAbierto = true;
    // Resetear campos
    this.nombre = '';
    this.contenido = '';
    this.imagenSeleccionada = null;
    this.isUrgent = false;
    this.tipoPost = 'general';
    this.empleoEmpresa = '';
    this.empleoSalario = '';
    this.empleoContacto = '';
    this.empleoUbicacion = '';
    this.empleoRequisitos = '';
    this.empleoJornada = 'tiempo_completo';
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

    // Construir metadata si es empleo
    let metadata = undefined;
    if (this.tipoPost === 'empleo') {
      metadata = {
        empresa: this.empleoEmpresa.trim(),
        salario: this.empleoSalario.trim(),
        contacto: this.empleoContacto.trim(),
        ubicacion: this.empleoUbicacion.trim(),
        requisitos: this.empleoRequisitos.split(',').map(r => r.trim()).filter(r => r),
        jornada: this.empleoJornada
      };
    }

    const nuevoPost: Partial<Post> = {
      author_id: user.id,
      title: this.nombre.trim() || contenido.substring(0, 50),
      content: contenido,
      type: this.tipoPost,
      is_urgent: this.isUrgent,
      images: this.imagenSeleccionada ? [this.imagenSeleccionada] : [],
      status: 'active',
      metadata: metadata
    };

    this.postService.crearPost(nuevoPost).subscribe({
      next: (post) => {
        this.posts.unshift(post);
        this.cerrarModal();
        setTimeout(() => {
          this.cargarReacciones();
          this.cargarComentarios();
        }, 100);
        alert('✅ Publicación creada');
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error al crear publicación');
      }
    });
  }
  obtenerRequisitos(requisitos: string | string[]): string {
  if (!requisitos) return '';
  if (Array.isArray(requisitos)) return requisitos.join(', ');
  return requisitos;
}
}