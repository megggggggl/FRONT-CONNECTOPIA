// features/admin/pages/categories/categories.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { MainLayout } from '../../../../core/layout/main-layout/main-layout';
import { WebServices } from '../../../../core/services/webServices';

interface RespuestaLista<T> {
  message?: string;
  data?: T[];
  error?: string;
}

interface RespuestaCategoria {
  message?: string;
  data?: Categoria;
  category?: Categoria;
  error?: string;
}

interface Categoria {
  id: number;
  name: string;
  entity_type: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoriaForm {
  name: string;
  entity_type: string;
  description: string;
  icon: string;
  is_active: boolean;
}

interface OpcionTipo {
  value: string;
  label: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayout],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesPageComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];

  busqueda = '';
  cargando = false;
  guardando = false;
  eliminandoId: number | null = null;
  endpointDisponible = true;

  error = '';
  exito = '';

  modalAbierto = false;
  confirmacionEliminarAbierta = false;
  editandoId: number | null = null;
  categoriaPendienteEliminar: Categoria | null = null;
  form: CategoriaForm = this.crearFormulario();

  readonly tiposSugeridos: OpcionTipo[] = [
    { value: 'event', label: 'Evento' },
    { value: 'post', label: 'Publicacion' },
    { value: 'service', label: 'Servicio' },
    { value: 'place', label: 'Lugar' },
    { value: 'report', label: 'Reporte' }
  ];
  readonly backendRequerido = [
    'GET /api/categories',
    'GET /api/categories/:id',
    'POST /api/categories',
    'PATCH /api/categories/:id',
    'DELETE /api/categories/:id'
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  get categoriasActivas(): number {
    return this.categorias.filter((categoria) => categoria.is_active !== false).length;
  }

  get tiposEntidad(): string[] {
    return Array.from(new Set(this.categorias.map((categoria) => categoria.entity_type).filter(Boolean)));
  }

  get categoriasInactivas(): number {
    return this.categorias.filter((categoria) => categoria.is_active === false).length;
  }

  cargarCategorias(mostrarLoading = true): void {
    if (mostrarLoading) {
      this.cargando = true;
    }
    this.error = '';
    this.endpointDisponible = true;

    this.http.get<Categoria[] | RespuestaLista<Categoria>>(WebServices.CategoriesList, {
      headers: this.crearHeaders()
    }).pipe(
      catchError((error: unknown) => {
        this.endpointDisponible = !(error instanceof HttpErrorResponse && error.status === 404);
        this.error = this.endpointDisponible
          ? this.obtenerMensajeError(error, 'No se pudieron cargar las categorias.')
          : 'El servidor remoto no expone /api/categories. La vista queda lista para consumirlo cuando el endpoint este disponible.';
        this.categorias = [];
        this.aplicarFiltros();
        return of<Categoria[] | RespuestaLista<Categoria>>([]);
      }),
      finalize(() => {
        if (mostrarLoading) {
          this.cargando = false;
        }
        this.cdr.detectChanges();
      })
    ).subscribe((respuesta) => {
      this.categorias = this.extraerLista(respuesta);
      this.aplicarFiltros();
      this.cdr.detectChanges();
    });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.categoriasFiltradas = this.categorias.filter((categoria) => {
      return !texto ||
        categoria.name.toLowerCase().includes(texto) ||
        categoria.entity_type.toLowerCase().includes(texto) ||
        this.obtenerEtiquetaTipo(categoria.entity_type).toLowerCase().includes(texto) ||
        String(categoria.description ?? '').toLowerCase().includes(texto);
    });
    this.cdr.detectChanges();
  }

  abrirCrear(): void {
    this.editandoId = null;
    this.form = this.crearFormulario();
    this.error = '';
    this.exito = '';
    this.modalAbierto = true;
  }

  abrirEditar(categoria: Categoria): void {
    this.editandoId = categoria.id;
    this.form = {
      name: categoria.name,
      entity_type: categoria.entity_type,
      description: categoria.description ?? '',
      icon: categoria.icon ?? '',
      is_active: categoria.is_active !== false
    };
    this.error = '';
    this.exito = '';
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.editandoId = null;
    this.form = this.crearFormulario();
  }

  guardarCategoria(): void {
    const editandoIdActual = this.editandoId;

    if (!this.form.name.trim() || !this.form.entity_type.trim()) {
      this.error = 'Nombre y tipo de entidad son obligatorios.';
      return;
    }

    const token = this.obtenerToken();
    if (!token) {
      this.error = 'Inicia sesion como admin para guardar categorias.';
      return;
    }

    const payload: Partial<Categoria> = {
      name: this.form.name.trim(),
      entity_type: this.form.entity_type.trim(),
      description: this.form.description.trim() || null,
      icon: this.form.icon.trim() || null,
      is_active: this.form.is_active
    };

    this.guardando = true;
    this.error = '';
    this.exito = '';

    const peticion = this.editandoId == null
      ? this.http.post<Categoria | RespuestaCategoria>(
          WebServices.CategoriesCreate,
          payload,
          { headers: this.crearHeaders(token) }
        )
      : this.http.patch<Categoria | RespuestaCategoria>(
          WebServices.CategoryUpdate(this.editandoId),
          payload,
          { headers: this.crearHeaders(token) }
        );

    peticion.pipe(
      finalize(() => {
        this.guardando = false;
        this.cdr.detectChanges();
      }),
      catchError((error: unknown) => {
        this.endpointDisponible = !(error instanceof HttpErrorResponse && error.status === 404);
        this.error = this.obtenerMensajeError(error, 'No se pudo guardar la categoria.');
        this.cdr.detectChanges();
        return of<Categoria | RespuestaCategoria | null>(null);
      })
    ).subscribe((respuesta) => {
      if (!respuesta) return;

      const error = this.extraerError(respuesta);
      if (error) {
        this.error = error;
        return;
      }

      this.exito = editandoIdActual == null ? 'Categoria creada.' : 'Categoria actualizada.';
      const categoriaGuardada = this.extraerCategoria(respuesta)
        ?? this.crearCategoriaLocalDesdePayload(payload, editandoIdActual);

      if (categoriaGuardada) {
        this.actualizarCategoriaLocal(categoriaGuardada, editandoIdActual == null);
      } else {
        this.cargarCategorias(false);
      }

      this.cerrarModal();
      this.cdr.detectChanges();
    });
  }

  abrirConfirmacionEliminar(categoria: Categoria): void {
    this.categoriaPendienteEliminar = categoria;
    this.confirmacionEliminarAbierta = true;
    this.error = '';
    this.exito = '';
  }

  cerrarConfirmacionEliminar(): void {
    if (this.eliminandoId) return;

    this.confirmacionEliminarAbierta = false;
    this.categoriaPendienteEliminar = null;
  }

  confirmarEliminarCategoria(): void {
    const categoria = this.categoriaPendienteEliminar;

    if (!categoria) {
      this.cerrarConfirmacionEliminar();
      return;
    }

    const token = this.obtenerToken();
    if (!token) {
      this.error = 'Inicia sesion como admin para eliminar categorias.';
      return;
    }

    this.eliminandoId = categoria.id;
    this.error = '';
    this.exito = '';

    this.http.delete<void>(WebServices.CategoryDelete(categoria.id), {
      headers: this.crearHeaders(token)
    }).pipe(
      finalize(() => {
        this.eliminandoId = null;
        this.cdr.detectChanges();
      }),
      catchError((error: unknown) => {
        this.endpointDisponible = !(error instanceof HttpErrorResponse && error.status === 404);
        this.error = this.obtenerMensajeError(error, 'No se pudo eliminar la categoria.');
        this.cdr.detectChanges();
        return of(false);
      })
    ).subscribe((eliminada) => {
      if (eliminada === false) return;

      this.exito = 'Categoria eliminada.';
      this.eliminarCategoriaLocal(categoria.id);
      this.confirmacionEliminarAbierta = false;
      this.categoriaPendienteEliminar = null;
      this.cdr.detectChanges();
    });
  }

  trackById(_: number, categoria: Categoria): number {
    return categoria.id;
  }

  obtenerEstadoClase(categoria: Categoria): string {
    return categoria.is_active === false ? 'status inactive' : 'status active';
  }

  obtenerEtiquetaEstado(categoria: Categoria): string {
    return categoria.is_active === false ? 'Inactivo' : 'Activo';
  }

  obtenerEtiquetaTipo(tipo: string | null | undefined): string {
    const valor = String(tipo ?? '').trim().toLowerCase();
    return this.tiposSugeridos.find((opcion) => opcion.value === valor)?.label ?? String(tipo ?? 'Sin tipo');
  }

  private crearFormulario(): CategoriaForm {
    return {
      name: '',
      entity_type: 'event',
      description: '',
      icon: '',
      is_active: true
    };
  }

  private extraerLista(respuesta: Categoria[] | RespuestaLista<Categoria>): Categoria[] {
    if (Array.isArray(respuesta)) return respuesta;
    return respuesta.data ?? [];
  }

  private extraerCategoria(respuesta: Categoria | RespuestaCategoria): Categoria | null {
    if (!respuesta || typeof respuesta !== 'object') return null;
    if ('data' in respuesta && respuesta.data) return respuesta.data;
    if ('category' in respuesta && respuesta.category) return respuesta.category;
    return 'id' in respuesta ? respuesta as Categoria : null;
  }

  private actualizarCategoriaLocal(categoria: Categoria, esNueva: boolean): void {
    const existe = this.categorias.some((item) => item.id === categoria.id);

    if (existe) {
      this.categorias = this.categorias.map((item) => item.id === categoria.id ? categoria : item);
    } else if (esNueva) {
      this.categorias = [categoria, ...this.categorias];
    }

    this.aplicarFiltros();
  }

  private eliminarCategoriaLocal(id: number): void {
    this.categorias = this.categorias.filter((categoria) => categoria.id !== id);
    this.aplicarFiltros();
  }

  private crearCategoriaLocalDesdePayload(
    payload: Partial<Categoria>,
    editandoId: number | null
  ): Categoria | null {
    if (editandoId == null) return null;

    const actual = this.categorias.find((categoria) => categoria.id === editandoId);
    if (!actual) return null;

    return {
      ...actual,
      ...payload,
      id: actual.id,
      created_at: actual.created_at,
      updated_at: new Date().toISOString()
    };
  }

  private extraerError(respuesta: Categoria | RespuestaCategoria): string {
    if (!respuesta || typeof respuesta !== 'object') return '';
    return 'error' in respuesta ? String(respuesta.error ?? '') : '';
  }

  private crearHeaders(token = this.obtenerToken()): HttpHeaders {
    const headers: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private obtenerToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private obtenerMensajeError(error: unknown, respaldo: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: string; message?: string } | string | null;
      if (typeof body === 'string') return body.trim() || respaldo;
      return body?.error ?? body?.message ?? respaldo;
    }

    return respaldo;
  }
}