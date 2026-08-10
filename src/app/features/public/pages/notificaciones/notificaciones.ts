import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification } from '../../../../core/models/notification.model';
import { MainLayout } from '../../../../core/layout/main-layout/main-layout';

@Component({
  selector: 'app-mis-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, MainLayout],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class MisNotificacionesComponent implements OnInit {
  notificaciones: Notification[] = [];
  loading = true;
  error = '';
  sinLeer = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.loading = true;
    this.error = '';
    this.notificationService.listarNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.sinLeer = data.filter(n => !n.is_read).length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar notificaciones.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  marcarLeida(notificacion: Notification): void {
    if (notificacion.is_read) return;
    this.notificationService.marcarLeida(notificacion.id).subscribe({
      next: () => {
        notificacion.is_read = true;
        this.sinLeer--;
      },
      error: (err) => console.error(err)
    });
  }

  marcarTodasLeidas(): void {
    if (this.sinLeer === 0) return;
    this.notificationService.marcarTodasLeidas().subscribe({
      next: () => {
        this.notificaciones.forEach(n => n.is_read = true);
        this.sinLeer = 0;
      },
      error: (err) => console.error(err)
    });
  }
}