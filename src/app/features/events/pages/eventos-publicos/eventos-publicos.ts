import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { EventService, Event } from '../../../../core/services/event.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TarjetaEvento } from '../../../../compartido/componentes/tarjeta-eventos/tarjeta-eventos';
@Component({
  selector: 'app-eventos-publicos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MainLayout, TarjetaEvento],
  templateUrl: './eventos-publicos.html',
  styleUrls: ['./eventos-publicos.css']
})
export class EventosPublicosComponent implements OnInit {
  eventos: Event[] = [];
  loading = true;
  error = '';
  isAuthenticated = false;
  isAdmin = false;
  userId: string | null = null;
  inscritos: string[] = []; // IDs de eventos donde el usuario está inscrito

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    const user = this.authService.getUser();
    this.userId = user?.id || null;
    this.isAdmin = this.authService.getUserRole() === 'admin';
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.loading = true;
    this.error = '';
    this.eventService.listarEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos.filter(e =>
          e.status !== 'cancelado' &&
          e.status !== 'finalizado' &&
          e.status !== 'cancelled' &&
          e.status !== 'finished'
        );
        this.loading = false;
        if (this.isAuthenticated) {
          this.cargarInscripciones();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar eventos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarInscripciones(): void {
    this.eventService.obtenerEventosInscritos().subscribe({
      next: (inscritos) => {
        this.inscritos = inscritos.map(e => e.id);
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar inscripciones')
    });
  }

  estaInscrito(eventoId: string): boolean {
    return this.inscritos.includes(eventoId);
  }

  registrarseEvento(eventoId: string): void {
    this.eventService.registrarse(eventoId).subscribe({
      next: () => {
        // Add to inscritos and update participant count locally
        this.inscritos.push(eventoId);
        const evento = this.eventos.find(e => e.id === eventoId);
        if (evento) {
          evento.current_participants = (evento.current_participants || 0) + 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al registrarse:', err);
        alert('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    });
  }

  cancelarRegistroEvento(eventoId: string): void {
    this.eventService.cancelarRegistro(eventoId).subscribe({
      next: () => {
        // Remove from inscritos and update participant count locally
        this.inscritos = this.inscritos.filter(id => id !== eventoId);
        const evento = this.eventos.find(e => e.id === eventoId);
        if (evento && evento.current_participants > 0) {
          evento.current_participants = (evento.current_participants || 1) - 1;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cancelar registro:', err);
        alert('No se pudo cancelar el registro. Inténtalo de nuevo.');
      }
    });
  }

  eliminarEvento(eventoId: string): void {
    if (!confirm('¿Eliminar este evento permanentemente?')) return;
    this.eventService.eliminarEvento(eventoId).subscribe({
      next: () => {
        alert('Evento eliminado.');
        this.eventos = this.eventos.filter(e => e.id !== eventoId);
        this.cdr.detectChanges();
      },
      error: () => alert('Error al eliminar evento.')
    });
  }

  obtenerImagen(evento: Event): string {
    return evento.images?.[0] || 'eventos.png';
  }

  obtenerCupo(evento: Event): string {
    const actual = Number(evento.current_participants ?? 0);
    return evento.max_participants == null
      ? `${actual} / sin límite`
      : `${actual} / ${evento.max_participants}`;
  }
}