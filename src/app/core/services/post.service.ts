// src/app/core/services/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { WebServices } from './webServices';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private postsCache: Post[] = [];

  constructor(private http: HttpClient) {}

  listarPosts(): Observable<Post[]> {
    return this.http.get<{ message: string; data: Post[] }>(WebServices.PostsList).pipe(
      map(res => res.data || []),
      tap((posts) => this.postsCache = posts)
    );
  }

  obtenerCache(): Post[] { return [...this.postsCache]; }
  guardarCache(posts: Post[]): void { this.postsCache = [...posts]; }

  crearPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post | { data: Post }>(WebServices.PostsCreate, post).pipe(
      map((response) => 'data' in response ? response.data : response),
      tap((created) => this.postsCache = [created, ...this.postsCache.filter((post) => post.id !== created.id)])
    );
  }

  actualizarPost(id: string, data: Partial<Post>): Observable<Post> {
    return this.http.patch<Post | { data: Post }>(WebServices.PostUpdate(id), data).pipe(
      map((response) => 'data' in response ? response.data : response)
    );
  }

  eliminarPost(id: string): Observable<void> {
    return this.http.delete<void>(WebServices.PostDelete(id)).pipe(
      tap(() => this.postsCache = this.postsCache.filter((post) => post.id !== id))
    );
  }
}
