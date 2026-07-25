// core/services/upload.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private api: ApiServicio) {}

  subirArchivo(file: File, carpeta: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', carpeta);
    return this.api.post<any>('/upload/url', formData).pipe(timeout(30000));
  }

  obtenerUrlPublica(filePath: string) {
    return this.api.get<any>(`/upload/public-url?path=${encodeURIComponent(filePath)}`).pipe(timeout(8000));
  }

  eliminarArchivo(filePath: string) {
    return this.api.delete<any>(`/upload/file?path=${encodeURIComponent(filePath)}`).pipe(timeout(8000));
  }

  listarArchivos(carpeta: string = '') {
    return this.api.get<any[]>(`/upload/list?folder=${carpeta}`).pipe(timeout(8000));
  }
}