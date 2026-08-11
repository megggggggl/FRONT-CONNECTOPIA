import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { WebServices } from '../../../../core/services/webServices';
import { FeedbackService } from '../../../../core/services/feedback.service';

interface BusRoute {
  id?: string;
  name: string;
  origin: string;
  destination: string;
  stops: any[];
  schedules: any[];
}

@Component({
  selector: 'app-bus-routes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus.html',
  styleUrls: ['./bus.css']
})
export class BusRoutesComponent implements OnInit {
  rutas: BusRoute[] = [];
  origen = '';
  destino = '';
  modalAbierto = false;
  editando = false;
  loading = true;
  error = '';
  form: BusRoute = { name: '', origin: '', destination: '', stops: [], schedules: [] };

  constructor(private http: HttpClient, private auth: AuthService, private cdr: ChangeDetectorRef, private feedback: FeedbackService) {}

  ngOnInit() {
    this.cargarRutas();
  }

  cargarRutas() {
    this.loading = true;
    this.error = '';
    this.http.get<any>(WebServices.BusRoutesList).subscribe({
      next: (resp) => {
        let data = resp?.data || resp || [];
        if (!Array.isArray(data)) data = [];
        this.rutas = data.map((r: any) => ({
          ...r,
          stops: Array.isArray(r.stops) ? r.stops : [],
          schedules: Array.isArray(r.schedules) ? r.schedules : []
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        this.error = 'No se pudieron cargar las rutas de buses.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Métodos para obtener arrays seguros
  getStops(ruta: BusRoute): any[] {
    return Array.isArray(ruta.stops) ? ruta.stops : [];
  }

  getSchedules(ruta: BusRoute): any[] {
    return Array.isArray(ruta.schedules) ? ruta.schedules : [];
  }

  buscarRutas() {
    this.loading = true;
    this.error = '';
    const url = `${WebServices.BusRoutesList}?origin=${this.origen}&destination=${this.destino}`;
    this.http.get<any>(url).subscribe({
      next: (resp) => {
        let data = resp?.data || resp || [];
        if (!Array.isArray(data)) data = [];
        this.rutas = data.map((r: any) => ({
          ...r,
          stops: Array.isArray(r.stops) ? r.stops : [],
          schedules: Array.isArray(r.schedules) ? r.schedules : []
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar rutas:', err);
        this.error = 'No se pudo completar la búsqueda.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(ruta?: BusRoute) {
    this.modalAbierto = true;
    this.editando = !!ruta;
    if (ruta) {
      this.form = {
        id: ruta.id,
        name: ruta.name,
        origin: ruta.origin,
        destination: ruta.destination,
        stops: Array.isArray(ruta.stops) ? [...ruta.stops] : [],
        schedules: Array.isArray(ruta.schedules) ? [...ruta.schedules] : []
      };
    } else {
      this.form = { name: '', origin: '', destination: '', stops: [], schedules: [] };
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.cdr.detectChanges();
  }

  agregarParada() {
    this.form.stops.push({ name: '', order_index: this.form.stops.length });
  }

  eliminarParada(index: number) {
    this.form.stops.splice(index, 1);
  }

  guardarRuta() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.feedback.info('Debes iniciar sesión');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      name: this.form.name,
      origin: this.form.origin,
      destination: this.form.destination,
      stops: this.form.stops,
      schedules: this.form.schedules
    };

    if (this.editando) {
      this.http.patch(`${WebServices.BusRoutesList}/${this.form.id}`, payload, { headers })
        .subscribe({
          next: (resp: any) => { const actualizada = resp?.data ?? resp; this.rutas = this.rutas.map(r => r.id === this.form.id ? { ...r, ...this.form, ...actualizada } : r); this.cerrarModal(); this.feedback.success('Ruta actualizada correctamente'); this.cdr.detectChanges(); },
          error: (err) => { console.error('Error al actualizar:', err); this.feedback.error('No se pudo actualizar la ruta'); }
        });
    } else {
      this.http.post(WebServices.BusRoutesList, payload, { headers })
        .subscribe({
          next: (resp: any) => { const creada = resp?.data ?? resp; this.rutas = [creada, ...this.rutas]; this.cerrarModal(); this.feedback.success('Ruta creada correctamente'); this.cdr.detectChanges(); },
          error: (err) => { console.error('Error al crear:', err); this.feedback.error('No se pudo crear la ruta'); }
        });
    }
  }

  async eliminarRuta(id: string) {
    if (!await this.feedback.confirm('¿Eliminar esta ruta?', { title: 'Eliminar ruta', confirmText: 'Eliminar', danger: true })) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.feedback.info('Debes iniciar sesión');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`${WebServices.BusRoutesList}/${id}`, { headers })
      .subscribe({
        next: () => { this.rutas = this.rutas.filter(r => r.id !== id); this.feedback.success('Ruta eliminada correctamente'); this.cdr.detectChanges(); },
        error: (err) => { console.error('Error al eliminar:', err); this.feedback.error('No se pudo eliminar la ruta'); }
      });
  }
}
