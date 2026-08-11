// src/app/core/services/moderation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebServices } from './webServices';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ContentReport {
  id: number;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  entity_id: string; // ID del post denunciado
  entity?: Post; // Datos del post, si se incluyen en la respuesta
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ModerationService {
  constructor(private http: HttpClient) {}

  // --- Publicaciones ---
  getPosts(status?: string): Observable<{ data: Post[] }> {
    const url = status ? `${WebServices.AdminPosts}?status=${status}` : WebServices.AdminPosts;
    return this.http.get<{ data: Post[] }>(url);
  }

  updatePostStatus(postId: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.patch(`${WebServices.AdminPosts}/${postId}`, { status });
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(`${WebServices.AdminPosts}/${postId}`);
  }

  // --- Denuncias ---
  getContentReports(status?: string): Observable<{ data: ContentReport[] }> {
    const url = status ? `${WebServices.ContentReportsList}?status=${status}` : WebServices.ContentReportsList;
    return this.http.get<{ data: ContentReport[] }>(url);
  }

  updateReportStatus(reportId: number, status: 'resolved' | 'rejected'): Observable<any> {
    return this.http.patch(`${WebServices.ContentReportsList}/${reportId}`, { status });
  }
}