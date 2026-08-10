import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { WebServices } from '../../../../core/services/webServices';

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
  form: BusRoute = { name: '', origin: '', destination: '', stops: [], schedules: [] };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.cargarRutas();
  }

  cargarRutas() {
    this.http.get<any>(WebServices.BusRoutesList).subscribe({
      next: (resp) => {
        let data = resp?.data || resp || [];
        if (!Array.isArray(data)) data = [];
        this.rutas = data.map((r: any) => ({
          ...r,
          stops: Array.isArray(r.stops) ? r.stops : [],
          schedules: Array.isArray(r.schedules) ? r.schedules : []
        }));
      },
      error: (err) => console.error('Error al cargar rutas:', err)
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

  cerrarModal() { this.modalAbierto = false; }

  agregarParada() {
    this.form.stops.push({ name: '', order_index: this.form.stops.length });
  }

  eliminarParada(index: number) {
    this.form.stops.splice(index, 1);
  }

  guardarRuta() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Debes iniciar sesión');
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
          next: () => { this.cargarRutas(); this.cerrarModal(); alert('✅ Ruta actualizada'); },
          error: (err) => console.error('Error al actualizar:', err)
        });
    } else {
      this.http.post(WebServices.BusRoutesList, payload, { headers })
        .subscribe({
          next: () => { this.cargarRutas(); this.cerrarModal(); alert('✅ Ruta creada'); },
          error: (err) => console.error('Error al crear:', err)
        });
    }
  }

  eliminarRuta(id: string) {
    if (!confirm('¿Eliminar esta ruta?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Debes iniciar sesión');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.delete(`${WebServices.BusRoutesList}/${id}`, { headers })
      .subscribe({
        next: () => { this.cargarRutas(); alert('✅ Ruta eliminada'); },
        error: (err) => console.error('Error al eliminar:', err)
      });
  }
}