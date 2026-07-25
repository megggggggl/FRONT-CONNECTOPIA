// core/services/verification.service.ts
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { ApiServicio } from './api.servicio';

@Injectable({ providedIn: 'root' })
export class VerificationService {
  constructor(private api: ApiServicio) {}

  iniciarVerificacion(formData: FormData) {
    return this.api.post<any>('/verification/start', formData).pipe(timeout(30000));
  }

  obtenerEstado() {
    return this.api.get<any>('/verification/status').pipe(timeout(8000));
  }

  revisarVerificacion(userId: string, approved: boolean, notes?: string) {
    return this.api.patch<any>(`/profiles/${userId}/verify`, { approved, notes }).pipe(timeout(8000));
  }
}