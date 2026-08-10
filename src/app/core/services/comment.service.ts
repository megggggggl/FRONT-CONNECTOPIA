// src/core/services/comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WebServices } from './webServices';

export interface Comment {
  id: number;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: number | null;
  created_at: string;
  deleted_at: string | null;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<{ data: Comment[] }>(`${WebServices.CommentsList}?post_id=${postId}`).pipe(
      map(res => res.data || [])
    );
  }

  createComment(postId: string, content: string, parentId?: number): Observable<Comment> {
    return this.http.post<{ data: Comment }>(WebServices.CommentsCreate, {
      post_id: postId,
      content,
      parent_id: parentId || null
    }).pipe(
      map(res => res.data)
    );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(WebServices.CommentDelete(commentId));
  }
}