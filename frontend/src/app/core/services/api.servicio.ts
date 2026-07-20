import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiServicio {
  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private obtenerToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('access_token');
  }

  private obtenerHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // Añadir cabeceras para evitar caché y problemas de ngrok
    headers = headers.set('ngrok-skip-browser-warning', 'true');
    headers = headers.set('Cache-Control', 'no-cache');
    headers = headers.set('Pragma', 'no-cache');
    return headers;
  }

  // Método privado para manejar errores de forma centralizada
  private manejarError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Error en petición HTTP:');
    console.error('  - URL:', error.url);
    console.error('  - Status:', error.status);
    console.error('  - StatusText:', error.statusText);
    console.error('  - Error:', error.error);
    console.error('  - Mensaje:', error.message);
    
    // Si la respuesta es un string (HTML), mostrarlo para depurar
    if (typeof error.error === 'string') {
      console.error('  - Respuesta (string):', error.error.substring(0, 500));
    }
    
    return throwError(() => error);
  }

  // Método privado para loguear peticiones
  private logPeticion(method: string, url: string): void {
    console.log(`🌐 ${method}: ${url}`);
  }

  // GET
  get<T>(ruta: string): Observable<T> {
    const urlCompleta = `${this.apiUrl}${ruta}`;
    this.logPeticion('GET', urlCompleta);
    
    return this.http.get<T>(urlCompleta, {
      headers: this.obtenerHeaders(),
      responseType: 'json'
    }).pipe(
      // Registrar la respuesta (solo si es necesario)
      tap((respuesta) => {
        console.log(`✅ GET ${ruta} - Respuesta recibida`);
      }),
      catchError(this.manejarError)
    );
  }

  // POST
  post<T>(ruta: string, body: unknown): Observable<T> {
    const urlCompleta = `${this.apiUrl}${ruta}`;
    this.logPeticion('POST', urlCompleta);
    
    return this.http.post<T>(urlCompleta, body, {
      headers: this.obtenerHeaders(),
      responseType: 'json'
    }).pipe(
      tap(() => console.log(`✅ POST ${ruta} - Respuesta recibida`)),
      catchError(this.manejarError)
    );
  }

  // PATCH
  patch<T>(ruta: string, body: unknown): Observable<T> {
    const urlCompleta = `${this.apiUrl}${ruta}`;
    this.logPeticion('PATCH', urlCompleta);
    
    return this.http.patch<T>(urlCompleta, body, {
      headers: this.obtenerHeaders(),
      responseType: 'json'
    }).pipe(
      tap(() => console.log(`✅ PATCH ${ruta} - Respuesta recibida`)),
      catchError(this.manejarError)
    );
  }

  // PUT
  put<T>(ruta: string, body: unknown): Observable<T> {
    const urlCompleta = `${this.apiUrl}${ruta}`;
    this.logPeticion('PUT', urlCompleta);
    
    return this.http.put<T>(urlCompleta, body, {
      headers: this.obtenerHeaders(),
      responseType: 'json'
    }).pipe(
      tap(() => console.log(`✅ PUT ${ruta} - Respuesta recibida`)),
      catchError(this.manejarError)
    );
  }

  // DELETE
  delete<T>(ruta: string): Observable<T> {
    const urlCompleta = `${this.apiUrl}${ruta}`;
    this.logPeticion('DELETE', urlCompleta);
    
    return this.http.delete<T>(urlCompleta, {
      headers: this.obtenerHeaders(),
      responseType: 'json'
    }).pipe(
      tap(() => console.log(`✅ DELETE ${ruta} - Respuesta recibida`)),
      catchError(this.manejarError)
    );
  }
}