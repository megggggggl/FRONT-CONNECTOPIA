import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WebServices } from './webServices';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}

listarPosts(): Observable<Post[]> {
  return this.http.get<{ message: string; data: Post[] }>('/api/posts').pipe(
    map(res => res.data || [])
  );
}

crearPost(post: Partial<Post>): Observable<Post> {
  return this.http.post<Post>('/api/posts', post);
}
}